import { Component, OnInit } from '@angular/core'
import { ConfigurationService } from '../Services/configuration.service'
import { MatDialog } from '@angular/material'
import { WelcomeBannerComponent } from '../welcome-banner/welcome-banner.component'

@Component({
  selector: 'app-welcome',
  templateUrl: 'welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})

export class WelcomeComponent implements OnInit {
  constructor (private dialog: MatDialog, private configurationService: ConfigurationService) { }

  ngOnInit (): void {
    this.configurationService.getApplicationConfiguration().subscribe((config: any) => {
      if (config && config.application && !config.application.welcomeBanner) {
        return
      }
      this.dialog.open(WelcomeBannerComponent, {
        minWidth: '320px',
        width: '35%',
        position: {
          top: '50px'
        }
      })
    }, (err) => console.log(err))
  }
}
