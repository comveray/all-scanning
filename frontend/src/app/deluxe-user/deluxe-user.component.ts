import { Component, OnInit } from '@angular/core'
import { UserService } from '../Services/user.service'
import { Router } from '@angular/router'
import { CookieService } from 'ngx-cookie'

@Component({
  selector: 'app-deluxe-user',
  templateUrl: './deluxe-user.component.html',
  styleUrls: ['./deluxe-user.component.scss']
})

export class DeluxeUserComponent implements OnInit {

  public membershipCost: Number = 0
  public error: string = undefined

  constructor (private router: Router, private userService: UserService, private cookieService: CookieService) { }

  ngOnInit () {
    this.userService.deluxeStatus().subscribe((res) => {
      this.membershipCost = res.membershipCost
    }, (err) => {
      this.error = err.error
      console.log(err)
    })
  }

  upgradeToDeluxe () {
    this.userService.upgradeToDeluxe().subscribe(() => {
      this.logout()
    }, (err) => console.log(err))
  }

  logout () {
    this.userService.saveLastLoginIp().subscribe((user: any) => { this.noop() }, (err) => console.log(err))
    localStorage.removeItem('token')
    this.cookieService.remove('token', { domain: document.domain })
    sessionStorage.removeItem('bid')
    this.userService.isLoggedIn.next(false)
    this.router.navigate(['/login'])
  }

  // tslint:disable-next-line:no-empty
  noop () { }
}
