import {
    Component
} from '@angular/core';
import {
    ColorSchemeService
} from 'src/theming.service';
import {
    APIService
} from './API.service';
import { AuthenticationResponse } from './shared/authentication.model';
import {
    SharedService
} from './shared/shared.service';
import {
    Router,
    NavigationStart
} from '@angular/router'
import { HttpClient, HttpParams } from '@angular/common/http';
import { AccountData } from './shared/account.model';
import { UserProfile } from './shared/user.model';
import { Location } from '@angular/common';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent {
    title = 'WebBooker';
    fleetId = '';
    custId = '';
    token = '';
    name = '';
    userId = '';
    username = '';
    url = '';
    sessionId: string;
    gettingSession = true;
    isLoggedIn = true;
    authPath = "https://9lwaroch9i.execute-api.us-east-2.amazonaws.com/prod/";
    orgNamePath = "https://7188s13ttk.execute-api.us-east-2.amazonaws.com/prod/";
    apiPath = "https://7188s13ttk.execute-api.us-east-2.amazonaws.com/test/";

    constructor(
        private colorSchemeService: ColorSchemeService,
        private sharedService: SharedService,
        public api: APIService,
        private router: Router,
        private http: HttpClient,
        private location: Location,
    ) {

        const userId = this.sharedService.getUserIdFromStorage();
        if (userId) {
            // this.getUserTrips(userId);
        } else {
            this.sharedService.setUserId();
        }
        // Load Color Scheme
        this.colorSchemeService.load();
    }

    ngOnInit() {

        console.log("~~~~~~~~~~~~~~~~ocbocbocbovbocoosdoskhoclsoclsddoclcoclololol~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");

        const pattern1 = /\/AccountReservationsWeb\/Acct\/(\w+)\/(\w+)\/([a-zA-Z0-9_-]+)/;
        const pattern2 = /\/AccountReservationsWeb\/Acct\/(\w+)\/(\w+)/;
        const pattern3 = /\/AccountReservationsWeb\/AccountAccess/;


        const currentUrl = this.location.path();

        const result1 = pattern1.exec(currentUrl);
        const result2 = pattern2.exec(currentUrl);


        if (currentUrl == "") {
            this.router.navigate(['/']);
        } else if(currentUrl == "/AccountReservationsWeb/AccountAccess"){
            this.gettingSession = false;
            this.isLoggedIn = false;
            this.router.navigate(['AccountReservationsWeb/AccountAccess']);
        }
        else if (result1 != null) {
            this.fleetId = result1[1];
            this.custId = result1[2];
            this.token = result1[3];
            this.sharedService.setToken(this.token);
            this.sharedService.custId = this.custId;
            this.url = "AccountReservationsWeb/Acct" + "/" + this.fleetId + "/" + this.custId;
            this.onVerify();
        } else {
            this.fleetId = result2[1];
            this.custId = result2[2];
            this.token = this.sharedService.getToken();
            this.sharedService.custId = this.custId;
            this.url= "AccountReservationsWeb/Acct" + "/" + this.fleetId + "/" + this.custId;
            this.onVerify();
        }
    }

    onVerify() {
        const params = new HttpParams()
            .append('token', this.sharedService.token);
        this.http
            .get(
                this.authPath +
                'appAuthentication/verifytoken',
                { params, withCredentials: false }
            )
            .subscribe(
                (response: any) => {
                    if (response.errorMessage) {
                        this.gettingSession = false;
                        this.isLoggedIn = false;
                        this.router.navigate(['AccountReservationsWeb/AccountAccess']);
                    } else {
                        const sessionData: AuthenticationResponse = JSON.parse(
                            response.body
                        );
                        if (sessionData.status === 'VERIFIED') {
                            this.getAccountInfo();
                            this.getUsername();
                            this.gettingSession = true;
                            this.isLoggedIn = true;
                            this.url = "AccountReservationsWeb/Acct" + "/" + this.fleetId + "/" + this.custId;
                            this.sharedService.setData(this.url);
                            this.router.navigate([this.url]);
                        } else {
                            this.gettingSession = false;
                            this.isLoggedIn = false;
                            
                            this.router.navigate(['AccountReservationsWeb/AccountAccess']);
                        }
                    }
                },
                (error) => {
                    this.gettingSession = false;
                    this.router.navigate(['AccountReservationsWeb/AccountAccess']);
                }
            );
    }

    onLogin(isLoggedIn: boolean) {
        this.isLoggedIn = isLoggedIn;
        this.gettingSession = true;
        
        this.url = this.sharedService.getData();
        this.router.navigate([this.url]);
    }
    getAccountInfo() {
        const params = new HttpParams()
            .append('custId', this.custId)
            .append('fleetId', this.fleetId)
            .append('zone', "ccsi")
            .append('token', this.token)
        this.http
            .get(this.orgNamePath + 'getorganization', {
                params,
                withCredentials: false,
            })
            .subscribe(
                (response: any) => {
                    if (response.errorMessage) {
                        return;
                    }
                    const body: AccountData = JSON.parse(response.body);
                    if (body.status === 'OK') {
                        this.name = body.accounts[0].name;
                        this.sharedService.setName(this.name);
                    } else if (body.status === 'NO_AUTH') {
                        return;
                    } else if (body.status === 'ERROR') {
                        return;
                    }
                },
                (error) => {
                    return;
                }
            );
    }
    getUsername() {
        const params = new HttpParams()
            .append('token', this.token)
        this.http
            .get(this.orgNamePath + 'userinterface', {
                params,
                withCredentials: false,
            })
            .subscribe(
                (response: any) => {
                    if (response.errorMessage) {
                        return;
                    }
                    const body: UserProfile = JSON.parse(response.body);
                    if (body.status === 'OK') {
                        this.username = body.user.xwiu_username;
                        console.log(this.username, "username");
                        this.sharedService.setUsername(this.username);
                    } else {
                        return;
                    }
                },
                (error) => {
                    return;
                }
            );
    }
}