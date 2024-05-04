import {Server4Test} from 'server4test';
import * as puppeteer from 'puppeteer';
import * as MiniTools  from 'mini-tools';
import * as discrepances from 'discrepances';
import {sleep} from 'best-globals'

import 'mocha';

const config = {
    test:{
        "view-chrome": true
    }
};

describe("interactive ",function(){
    var browser: puppeteer.Browser;
    var page   : puppeteer.Page;
    var server : Server4Test;
    before(async function(){
        this.timeout(50000);
        server = new Server4Test({port:43332});
        console.log("starting server");
        await server.start();
        browser = await puppeteer.launch({headless: !!process.env.TRAVIS || !config.test["view-chrome"], slowMo: 50});
        page = await browser.newPage();
        page.on('console', msg => { 
            console.log('console.'+msg.type(), msg.text()) 
        });
        await page.setViewport({width:1360, height:768});
        await page.goto('http://localhost:'+server.port+'/example/popup-dp.html');
        console.log('system ready');
    });
    it("open and close dialogs", async function(){
        this.timeout(50000);
        await page.waitForSelector('#alert_example1');
        var none = await page.$$('.dialog_promise');
        discrepances.showAndThrow(none, [], {showContext:'dialog must not exists'});
        await page.click('#alert_example1');
        await page.waitForSelector('.dialog-promise', {visible:true});
        await page.click('#alert_example1');
        var none = await page.$$('.dialog_promise');
        discrepances.showAndThrow(none, [], {showContext:'dialog must not exists (part 2)'});
        await page.click('#prompt_example2');
        await page.waitForSelector('.dialog-promise', {visible:true});
        await page.keyboard.press('Enter');
        var none = await page.$$('.dialog_promise');
        discrepances.showAndThrow(none, [], {showContext:'dialog must not exists (part 3)'});
        await page.waitForSelector('#prompt_example2', {visible:true});
        var title = await page.$eval('#prompt_example2', prompt_example2 => (prompt_example2 as HTMLElement).title);
        discrepances.showAndThrow(title,"Example Two");
        return 1;
    });
    after(async function(){
        await sleep(process.env.TRAVIS?10:1000);
        await browser.close()
        await server.closeServer();
    });
});

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});