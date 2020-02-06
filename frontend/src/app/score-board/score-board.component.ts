/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { MatTableDataSource } from '@angular/material/table'
import { DomSanitizer } from '@angular/platform-browser'
import { ChallengeService } from '../Services/challenge.service'
import { ConfigurationService } from '../Services/configuration.service'
import { Component, NgZone, OnInit } from '@angular/core'
import { SocketIoService } from '../Services/socket-io.service'
import { NgxSpinnerService } from 'ngx-spinner'

import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { faStar, faTrophy, faPollH } from '@fortawesome/free-solid-svg-icons'
import { faGem } from '@fortawesome/free-regular-svg-icons'
import { faBtc, faGithub, faGitter } from '@fortawesome/free-brands-svg-icons'
import { Challenge } from '../Models/challenge.model'
import { TranslateService } from '@ngx-translate/core'

library.add(faStar, faGem, faGitter, faGithub, faBtc, faTrophy, faPollH)
dom.watch()

@Component({
  selector: 'app-score-board',
  templateUrl: './score-board.component.html',
  styleUrls: ['./score-board.component.scss']
})
export class ScoreBoardComponent implements OnInit {

  public availableDifficulties: number[] = [1, 2, 3, 4, 5, 6]
  public displayedDifficulties: number[] = []
  public availableChallengeCategories: string[] = []
  public displayedChallengeCategories: string[] = []
  public toggledMajorityOfDifficulties: boolean = false
  public toggledMajorityOfCategories: boolean = true
  public showSolvedChallenges: boolean = true
  public challengesDisabled: boolean = false
  public showDisabledChallenges: boolean = false
  public displayedColumns = ['name', 'difficulty', 'description', 'category', 'status']
  public offsetValue = ['100%', '100%', '100%', '100%', '100%', '100%']
  public allowRepeatNotifications: boolean = false
  public showChallengeHints: boolean = true
  public showHackingInstructor: boolean = true
  public challenges: Challenge[] = []
  public percentChallengesSolved: string = '0'
  public solvedChallengesOfDifficulty: Challenge[][] = [[], [], [], [], [], []]
  public totalChallengesOfDifficulty: Challenge[][] = [[], [], [], [], [], []]
  public showContributionInfoBox: boolean = true
  public questionnaireUrl: string = 'https://forms.gle/2Tr5m1pqnnesApxN8'
  public appName: string = 'OWASP Juice Shop'

  constructor (private configurationService: ConfigurationService, private challengeService: ChallengeService, private sanitizer: DomSanitizer, private ngZone: NgZone, private io: SocketIoService, private spinner: NgxSpinnerService, private translate: TranslateService) {
  }

  ngOnInit () {
    this.spinner.show()

    this.displayedDifficulties = localStorage.getItem('displayedDifficulties') ? JSON.parse(String(localStorage.getItem('displayedDifficulties'))) : [1]
    this.showSolvedChallenges = localStorage.getItem('showSolvedChallenges') ? JSON.parse(String(localStorage.getItem('showSolvedChallenges'))) : true
    this.showDisabledChallenges = localStorage.getItem('showDisabledChallenges') ? JSON.parse(String(localStorage.getItem('showDisabledChallenges'))) : false

    this.configurationService.getApplicationConfiguration().subscribe((config) => {
      this.allowRepeatNotifications = config.challenges.showSolvedNotifications && config.ctf.showFlagsInNotifications
      this.showChallengeHints = config.challenges.showHints
      this.showHackingInstructor = config.hackingInstructor && config.hackingInstructor.isEnabled
      this.showContributionInfoBox = config.application.showGitHubLinks
      this.questionnaireUrl = config.application.social && config.application.social.questionnaireUrl
      this.appName = config.application.name
    }, (err) => console.log(err))

    this.challengeService.find({ sort: 'name' }).subscribe((challenges) => {
      this.challenges = challenges
      for (let i = 0; i < this.challenges.length; i++) {
        this.augmentHintText(this.challenges[i])
        this.trustDescriptionHtml(this.challenges[i])
        if (this.challenges[i].name === 'Score Board') {
          this.challenges[i].solved = true
        }
        if (!this.availableChallengeCategories.includes(challenges[i].category)) {
          this.availableChallengeCategories.push(challenges[i].category)
        }
        if (this.showHackingInstructor) {
          import(/* webpackChunkName: "tutorial" */ '../../hacking-instructor').then(module => {
            challenges[i].hasTutorial = module.hasInstructions(challenges[i].name)
          })
        }
      }
      this.availableChallengeCategories.sort()
      this.displayedChallengeCategories = localStorage.getItem('displayedChallengeCategories') ? JSON.parse(String(localStorage.getItem('displayedChallengeCategories'))) : this.availableChallengeCategories
      this.calculateProgressPercentage()
      this.populateFilteredChallengeLists()
      this.calculateGradientOffsets(challenges)

      this.toggledMajorityOfDifficulties = this.determineToggledMajorityOfDifficulties()
      this.toggledMajorityOfCategories = this.determineToggledMajorityOfCategories()

      this.spinner.hide()
    }, (err) => {
      this.challenges = []
      console.log(err)
    })

    this.ngZone.runOutsideAngular(() => {
      this.io.socket().on('challenge solved', (data: any) => {
        if (data && data.challenge) {
          for (let i = 0; i < this.challenges.length; i++) {
            if (this.challenges[i].name === data.name) {
              this.challenges[i].solved = true
              break
            }
          }
          this.calculateProgressPercentage()
          this.populateFilteredChallengeLists()
          this.calculateGradientOffsets(this.challenges)
        }
      })
    })
  }

  augmentHintText (challenge: Challenge) {
    if (challenge.disabledEnv) {
      this.translate.get('CHALLENGE_UNAVAILABLE',{ env: challenge.disabledEnv }).subscribe((challengeUnavailable) => {
        challenge.hint = challengeUnavailable
      }, (translationId) => {
        challenge.hint = translationId
      })
    } else if (challenge.hintUrl) {
      if (challenge.hint) {
        this.translate.get('CLICK_FOR_MORE_HINTS').subscribe((clickForMoreHints) => {
          challenge.hint += ` ${clickForMoreHints}`
        }, (translationId) => {
          challenge.hint += ` ${translationId}`
        })
      } else {
        this.translate.get('CLICK_TO_OPEN_HINTS').subscribe((clickToOpenHints) => {
          challenge.hint = clickToOpenHints
        }, (translationId) => {
          challenge.hint = translationId
        })
      }
    }
  }

  trustDescriptionHtml (challenge: Challenge) {
    challenge.description = this.sanitizer.bypassSecurityTrustHtml(challenge.description as string)
  }

  calculateProgressPercentage () {
    let solvedChallenges = 0
    for (let i = 0; i < this.challenges.length; i++) {
      solvedChallenges += (this.challenges[i].solved) ? 1 : 0
    }
    this.percentChallengesSolved = (100 * solvedChallenges / this.challenges.length).toFixed(0)
  }

  calculateGradientOffsets (challenges: Challenge[]) {
    for (let difficulty = 1; difficulty <= 6; difficulty++) {
      let solved = 0
      let total = 0

      for (let i = 0; i < challenges.length; i++) {
        if (challenges[i].difficulty === difficulty) {
          total++
          if (challenges[i].solved) {
            solved++
          }
        }
      }

      let offset: any = Math.round(solved * 100 / total)
      offset = 100 - offset
      offset = +offset + '%'
      this.offsetValue[difficulty - 1] = offset
    }
  }

  toggleDifficulty (difficulty: number) {
    if (!this.displayedDifficulties.includes(difficulty)) {
      this.displayedDifficulties.push(difficulty)
    } else {
      this.displayedDifficulties = this.displayedDifficulties.filter((c) => c !== difficulty)
    }
    localStorage.setItem('displayedDifficulties', JSON.stringify(this.displayedDifficulties))
    this.toggledMajorityOfDifficulties = this.determineToggledMajorityOfDifficulties()
  }

  toggleAllDifficulty () {
    if (this.toggledMajorityOfDifficulties) {
      this.displayedDifficulties = []
      this.toggledMajorityOfDifficulties = false
    } else {
      this.displayedDifficulties = this.availableDifficulties
      this.toggledMajorityOfDifficulties = true
    }
    localStorage.setItem('displayedDifficulties', JSON.stringify(this.displayedDifficulties))
  }

  toggleShowSolvedChallenges () {
    this.showSolvedChallenges = !this.showSolvedChallenges
    localStorage.setItem('showSolvedChallenges', JSON.stringify(this.showSolvedChallenges))
  }

  toggleShowDisabledChallenges() {
    this.showDisabledChallenges = !this.showDisabledChallenges
    localStorage.setItem('showDisabledChallenges', JSON.stringify(this.showDisabledChallenges))
  }

  toggleShowChallengeCategory (category: string) {
    if (!this.displayedChallengeCategories.includes(category)) {
      this.displayedChallengeCategories.push(category)
    } else {
      this.displayedChallengeCategories = this.displayedChallengeCategories.filter((c) => c !== category)
    }
    localStorage.setItem('displayedChallengeCategories', JSON.stringify(this.displayedChallengeCategories))
    this.toggledMajorityOfCategories = this.determineToggledMajorityOfCategories()
  }

  toggleAllChallengeCategory () {
    if (this.toggledMajorityOfCategories) {
      this.displayedChallengeCategories = []
      this.toggledMajorityOfCategories = false
    } else {
      this.displayedChallengeCategories = this.availableChallengeCategories
      this.toggledMajorityOfCategories = true
    }
    localStorage.setItem('displayedChallengeCategories', JSON.stringify(this.displayedChallengeCategories))
  }

  determineToggledMajorityOfDifficulties () {
    return this.displayedDifficulties.length > this.availableDifficulties.length / 2
  }

  determineToggledMajorityOfCategories () {
    return this.displayedChallengeCategories.length > this.availableChallengeCategories.length / 2
  }

  filterToDataSource (challenges: Challenge[]) {
    challenges = challenges.filter((challenge) => {
      if (!this.displayedDifficulties.includes(challenge.difficulty)) return false
      if (!this.displayedChallengeCategories.includes(challenge.category)) return false
      if (!this.showSolvedChallenges && challenge.solved) { this.challengesDisabled = true; return false }
      return true
    })

    let dataSource = new MatTableDataSource()
    dataSource.data = challenges
    return dataSource
  }

  populateFilteredChallengeLists () {
    for (const difficulty of this.availableDifficulties) {
      if (this.challenges.length === 0) {
        this.totalChallengesOfDifficulty[difficulty - 1] = []
        this.solvedChallengesOfDifficulty[difficulty - 1] = []
      } else {
        this.totalChallengesOfDifficulty[difficulty - 1] = this.challenges.filter((challenge) => challenge.difficulty === difficulty)
        this.solvedChallengesOfDifficulty[difficulty - 1] = this.challenges.filter((challenge) => challenge.difficulty === difficulty && challenge.solved === true)
      }
    }
  }

  startHackingInstructor (challengeName: String) {
    console.log(`Starting instructions for challenge "${challengeName}"`)
    import(/* webpackChunkName: "tutorial" */ '../../hacking-instructor').then(module => {
      module.startHackingInstructorFor(challengeName)
    })
  }

  trackById (index: number, item: any) {
    return item.id
  }
}
