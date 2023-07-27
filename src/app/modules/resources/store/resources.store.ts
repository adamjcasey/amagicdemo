import { environment } from 'src/environments/environment';

import * as fromSharedServices from '@shared/services';

export interface ResourcesState {
  entryPageVisited: boolean;
  yourCareTeamPageVisited: boolean;
  memberSelected?: any;
  yourCareTeam: any;
}

let initialState: ResourcesState;
if (environment.production) {
  initialState = {
    entryPageVisited: false,
    yourCareTeamPageVisited: false,
    yourCareTeam: {
      myTeam: [],
      caregivers: [],
    }
  }
}
else {
  initialState = {
    entryPageVisited: false,
    yourCareTeamPageVisited: false,
    memberSelected: {
      name: 'Dr. James David',
      role: 'Primary Care Physician (PCP)',
      photo: '/assets/images/care-team-avatar-1.svg',
      email: 'dr_smith@gmail.com',
      video: '#',
      phone: '+49 571061332',
      permissions: [
        'dose-history',
        'prescription-info',
      ],
    },
    yourCareTeam: {
      myTeam: [
        {
          name: 'Dr. James David',
          role: 'Primary Care Physician (PCP)',
          photo: '/assets/images/care-team-avatar-1.svg',
          email: 'dr_smith@gmail.com',
          video: '#',
          phone: '+49 571061332',
          permissions: [
            'dose-history',
            'prescription-info',
          ],
        },
        {
          name: 'Dr. Jess  Santiago',
          role: 'Endocrinologist',
          photo: `https://ui-avatars.com/api/?name=Jess+Santiago&size=120&color=ffffff&background=${fromSharedServices.UtilsService.getRandomColor()}`,
          email: 'dr_smith@gmail.com',
          video: '#',
          phone: '+49 571061332',
          permissions: [
            'prescription-info',
            'injection-site-photos',
          ],
        },
      ],
      caregivers: [
        {
          name: 'Dr. James David',
          role: 'Emergency Contact',
          photo: `https://ui-avatars.com/api/?name=James+David&size=120&color=ffffff&background=${fromSharedServices.UtilsService.getRandomColor()}`,
          website: '#',
          phone: '+49 571061332',
          permissions: [
            'dose-history',
          ],
        },
      ]
    }
  }
}

export { initialState }
