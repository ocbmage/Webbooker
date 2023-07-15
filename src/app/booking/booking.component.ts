import { Component, OnInit, Input } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { BookingService } from './shared/booking-service';

@Component({
    selector: 'app-booking',
    templateUrl: './booking.component.html',
    styleUrls: ['./booking.component.css'],
})
export class BookingComponent implements OnInit {
    bookingDataRefreshSubscription: Subscription = null;

    subscriptions: Subscription[] = [this.bookingDataRefreshSubscription];

    @Input('fleetId') fleetId: string;
    @Input('custId') custId: string;
    @Input('token') token: string;
    @Input('name') name: string;
    @Input('username') username: string;

    public constructor(private bookingService: BookingService) {
        // refresh booking data every 10 minutes
        this.bookingDataRefreshSubscription = interval(600000).subscribe(() => {
            this.bookingService.refreshbookingData();
        });
    }

    public ngOnInit(): void {
        this.fleetId
        this.custId
        this.token
    }

    public ngOnDestroy(): void {
        this.subscriptions.forEach((subscription: Subscription) => {
            subscription.unsubscribe();
        });
    }
}
