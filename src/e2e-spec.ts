import { browser, by, element, protractor, ElementFinder } from 'protractor';
import axios from 'axios';
import { serverUrl } from './app/config';

async function getAuthToken(username: string, password: string): Promise<string> {
    const url = `${serverUrl}/login`;
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    const body = `username=${username}&password=${password}`;
    try {
        const response = await axios.post(url, body, { headers: headers });
        return response.data.token;
    } catch (error) {
        throw new Error(`Failed to get token: ${error.message}`);
    }
}

describe('Login Functionality', () => {
    let authToken: string;

    beforeAll(async (done) => {
        console.log('Getting authentication token');
        authToken = await getAuthToken('sandhata_demo', 'sandhata');
        console.log('Authentication token obtained:', authToken);
        done();
    }, 120000); // 2 minutes timeout

    beforeEach(async (done) => {
        console.log('Navigating to home page');
        await browser.get('http://10.10.1.135:400');
        done();
    });

    it('should open the login form, enter credentials, and log in with custom headers', async (done) => {
        console.log('Opening login form');
        const loginButton: ElementFinder = element(by.id('login_button'));
        await loginButton.click();

        const loginForm: ElementFinder = element(by.id('login-form'));
        await browser.wait(protractor.ExpectedConditions.visibilityOf(loginForm), 10000, 'Login form taking too long to appear');
        console.log('Login form is visible');

        const usernameInput: ElementFinder = element(by.id('username'));
        const passwordInput: ElementFinder = element(by.id('password'));
        await usernameInput.sendKeys('sandhata_demo');
        await passwordInput.sendKeys('sandhata');
        console.log('Entered credentials');

        const submitButton: ElementFinder = element(by.css('.submit-button'));
        await submitButton.click();

        await browser.wait(protractor.ExpectedConditions.urlContains('/dashboard'), 10000, 'URL does not contain /dashboard after login');
        console.log('Navigated to dashboard');
        expect(await browser.getCurrentUrl()).toContain('/dashboard');
        done();
    }, 120000); // 2 minutes timeout

    describe('Navigation to Transaction Page', () => {
        beforeEach(async (done) => {
            console.log('Navigating to dashboard page');
            await browser.get('http://10.10.1.135:400/dashboard');
            done();
        });

        it('should navigate to the dashboard page', async (done) => {
            expect(await browser.getCurrentUrl()).toContain('/dashboard');
            done();
        }, 120000); // 2 minutes timeout

        it('should click on the current account', async (done) => {
            console.log('Clicking on current account');
            const currentAccountLink: ElementFinder = element(by.cssContainingText('.bank', 'Current Account'));
            await currentAccountLink.click();
            done();
        }, 120000); // 2 minutes timeout

        it('should ensure redirection to the transaction page', async (done) => {
            console.log('Clicking on current account');
            const currentAccountLink: ElementFinder = element(by.cssContainingText('.bank', 'Current Account'));
            await currentAccountLink.click();
            await browser.wait(protractor.ExpectedConditions.urlContains('/transaction'), 10000, 'URL does not contain /transaction after clicking on current account');
            console.log('Navigated to transaction page');
            expect(await browser.getCurrentUrl()).toContain('/transaction');
            done();
        }, 120000); // 2 minutes timeout

        it('should verify balance in the transaction history table is not zero', async (done) => {
            console.log('Clicking on current account');
            const currentAccountLink: ElementFinder = element(by.cssContainingText('.bank', 'Current Account'));
            await currentAccountLink.click();
            const balanceCellsContainer: ElementFinder = element(by.css('.table-container'));
            await browser.wait(protractor.ExpectedConditions.presenceOf(balanceCellsContainer), 10000, 'Balance cells container not found');
            console.log('Balance cells container found');

            const balanceColumnCells: ElementFinder[] = await element.all(by.css('.table-container td:nth-child(6)'));
            for (let i = 0; i < balanceColumnCells.length; i++) {
                const balance: string = await balanceColumnCells[i].getText();
                console.log(`Balance for row ${i + 1}: ${balance}`);
                expect(parseFloat(balance.replace('USD ', '').replace(',', ''))).not.toBe(0, `Balance is displayed as zero for transaction row ${i + 1}`);
            }
            done();
        }, 120000); // 2 minutes timeout
    });

    describe('Back Button Functionality', () => {
        beforeEach(async (done) => {
            console.log('Navigating to transaction page');
            await browser.get('http://10.10.1.135:400/transaction');
            done();
        });

        it('should navigate to the transaction page', async (done) => {
            expect(await browser.getCurrentUrl()).toContain('/transaction');
            done();
        }, 120000); // 2 minutes timeout

        it('should click the back button and ensure redirection back to the dashboard page', async (done) => {
            console.log('Clicking back button');
            const backButton: ElementFinder = element(by.css('.back-button'));
            await backButton.click();
            await browser.wait(protractor.ExpectedConditions.urlContains('/dashboard'), 10000, 'URL does not contain /dashboard after clicking back');
            console.log('Navigated back to dashboard');
            expect(await browser.getCurrentUrl()).toContain('/dashboard');
            done();
        }, 120000); // 2 minutes timeout
    });

    describe('Logout Functionality', () => {
        beforeEach(async (done) => {
            console.log('Navigating to dashboard page');
            await browser.get('http://10.10.1.135:400/dashboard');
            done();
        });

        it('should have a logout button that is clickable', async (done) => {
            const logoutButton: ElementFinder = element(by.id('logout_button'));
            expect(await logoutButton.isPresent()).toBe(true);
            expect(await logoutButton.isEnabled()).toBe(true);
            done();
        }, 120000); // 2 minutes timeout

        it('should log out and redirect to the login page', async (done) => {
            console.log('Clicking logout button');
            const logoutButton: ElementFinder = element(by.id('logout_button'));
            await logoutButton.click();
            await browser.wait(protractor.ExpectedConditions.urlContains('/home'), 10000, 'URL does not contain /home after clicking logout');
            console.log('Logged out and navigated to home');
            expect(await browser.getCurrentUrl()).toContain('/home');
            done();
        }, 120000); // 2 minutes timeout
    });
});


