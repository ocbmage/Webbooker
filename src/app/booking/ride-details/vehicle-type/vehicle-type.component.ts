import { Component, Input } from '@angular/core';
import { Fare } from 'src/app/shared/Fare.model';
import { TripDetailsService } from '../../shared/trip-details.service';
import {
    VehicleType,
} from 'src/app/API.service';

@Component({
    selector: 'app-vehicle-type',
    templateUrl: './vehicle-type.component.html',
    styleUrls: ['./vehicle-type.component.css'],
})
export class VehicleTypeComponent {
    VEHICLE_TYPES: any = {
        '1': {
            displayName: 'Standard Taxi',
            numberOfSeats: '4 seats',
            desc: 'Fastest ride to get you there.',
            icon: 'standard-taxi.png',
        },
        '2': {
            displayName: 'Roomy Taxi',
            numberOfSeats: '4 seats',
            desc: 'A wagon or minivan for extra stuff.',
            icon: 'roomy-taxi.png',
        },
        '3': {
            displayName: 'Minivan Taxi',
            numberOfSeats: '6 seats',
            desc: 'A bigger vehicle for your group.',
            icon: 'minivan-taxi.png',
        },
        '4': {
            displayName: 'Accessible Van',
            numberOfSeats: '4 seats + 1 wheelchair',
            desc: 'Limited supply. 24 hr advanced booking recommended.',
            icon: 'wheelchair-van-taxi.png',
        },
    };

    @Input('type') type: string;
    @Input('isOption') isOption: boolean;
  //  @Input('fare') fare: Fare;
    @Input('displayFare') displayFare: Fare;
    @Input('eta') eta: number;
    @Input('isNow') isNow: any;
    @Input('selectableTypes') selectableTypes: VehicleType[];

    countExist = 0;

    constructor(public tripDetailsService: TripDetailsService) {
        
    }

    public formatEta(type: string, eta: number): string {
        // ! is an eta of -1 unavailable ?
        if (type === '4' || eta < 0) {
            // return 'Unavailable';
            return 'None Nearby';  // fixed by Chad's request
        }

        let display = '';
        // if (eta > 60) {
        //     const hours = eta / 60;
        //     const rHours = Math.floor(hours);
        //     const minutes = (hours - rHours) * 60;
        //     const rMinutes = Math.round(minutes);
        //     display = `${rHours} hr`;
        //     if (rMinutes > 0) {
        //         display += ` ${rMinutes} min`;
        //     }
        // } else {
        //     display = `${eta} min`;
        // }
        if (eta > 60) {
            display = `${Math.round(eta / 60)} min`;
        } else {
            display = `${eta} min`;
        }
        return display;
    }

    public getCountExist() : number{
        this.countExist = 0;
        for(let i = 0 ; i < this.selectableTypes.length ; i ++) {
            if(this.selectableTypes[i].exist == 1)
               this.countExist++;
        }

        return this.countExist;
    }

    public getFare(): void {
        this.displayFare = null;
        this.tripDetailsService.getFare();
    }
}
