import { environment } from 'src/environments/environment';
import * as moment from 'moment';

import * as fromSharedServices from '@shared/services';

export interface ResourcesState {
  entryPageVisited: boolean;
  yourCareTeamPageVisited: boolean;
  memberSelected?: any;
  yourCareTeam: any;
  communityFeeds: any[];
  educationFeeds: any[];
  supportPatientChat?: any;
}

let initialState: ResourcesState;
if (environment.production) {
  initialState = {
    entryPageVisited: false,
    yourCareTeamPageVisited: false,
    yourCareTeam: {
      myTeam: [],
      caregivers: [],
    },
    communityFeeds: [],
    educationFeeds: [],
  }
}
else {
  initialState = {
    entryPageVisited: false,
    yourCareTeamPageVisited: false,
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
    },
    communityFeeds: [
      {
        avatar: `https://ui-avatars.com/api/?name=Joel+Douong&size=120&color=ffffff&background=${fromSharedServices.UtilsService.getRandomColor()}`,
        name: 'Joel Duong',
        date: moment().subtract(40, 'minutes').toString(),
        template: `
          <p>Nunc odio felis, imperdiet a arcu et, ornare condimentum augue. Proin vel leo lectus.</p>
        `,
        likes: 30,
        comments: 5,
      },
      {
        avatar: `https://ui-avatars.com/api/?name=Jess+Santiago&size=120&color=ffffff&background=${fromSharedServices.UtilsService.getRandomColor()}`,
        name: 'Jess Santiago',
        date: moment().subtract(2, 'hours').toString(),
        asset: '/assets/images/feed-card-post-1.png',
        template: `
          <h5>8 month mark!</h5>
          <p>Praesent mollis hendrerit rutrum. In quis ullamcorper ipsum. Nullam gravida ex vitae nulla egestas faucibus.</p>
        `,
        likes: 54,
        comments: 12,
      },
      {
        avatar: `https://ui-avatars.com/api/?name=Cali+Huffman&size=120&color=ffffff&background=${fromSharedServices.UtilsService.getRandomColor()}`,
        name: 'Cali Huffman',
        date: moment().subtract(5, 'hours').toString(),
        template: `
          <h5>Meetup in Philly!</h5>
          <p>Et obcaecati incidunt ut nisi temporibus et nobis cumque qui unde molestiae.</p>
        `,
        likes: 76,
        comments: 25,
      },
      {
        avatar: `https://ui-avatars.com/api/?name=Joel+Douong&size=120&color=ffffff&background=${fromSharedServices.UtilsService.getRandomColor()}`,
        name: 'Joel Duong',
        date: moment().subtract(1, 'day').toString(),
        template: `
          <h5>Mild itching? </h5>
          <p>Est ratione quaerat est debitis perferendis cum libero doloremque aut commodi dolores aut omnis consectetur nam dolores adipisci sed eveniet iusto.</p>
        `,
        likes: 150,
        comments: 45,
      }
    ],
    educationFeeds: [
      {
        asset: `/assets/images/feed-card-article-1.png`,
        date: moment().subtract(40, 'minutes').toString(),
        template: `
          <h5>Supplements to consider for Theryx patients</h5>
          <p>Sit expedita ullam qui itaque veniam et officia quae ut illo corporis. Aut enim nemo qui... Continue Reading</p>
        `,
      },
      {
        date: moment().subtract(2, 'hours').toString(),
        template: `
          <h5>New diagnostic method improves early detection</h5>
          <p>Non praesentium pariatur et velit ipsam ut odit cupiditate et cumque voluptas nam impedit perspiciatis... Continue Reading</p>
        `,
      },
      {
        asset: `/assets/images/feed-card-article-2.png`,
        date: moment().subtract(5, 'hours').toString(),
        template: `
          <h5>USC Keck partners on new research program </h5>
          <p>Rem neque dicta sit omnis dolor et galisum consequuntur qui eaque nihil. Id sunt iste... Continue Reading</p>
        `,
      },
    ],
    supportPatientChat: {
      to: {
        name: 'Bruno',
        role: 'Your Patient Support Manager',
        phone: '+155555555',
        photo: '/assets/images/patient-support-manager.svg',
        status: 'online',
      },
      messages: [
        {
          type: 'from',
          content: 'I’m going to be traveling for my next injection. How do I make sure to get my Theryx when I’m away?',
        },
        {
          type: 'to',
          content: 'I can help you with that where will you be traveling? Also how are you doing?',
        },
        {
          type: 'from',
          content: 'I’m going to be traveling for my next injection. How do I make sure to get my Theryx when I’m away?',
        },
        {
          type: 'to',
          content: 'I can help you with that where will you be traveling? Also how are you doing?',
        },
        {
          type: 'from',
          content: 'I’m going to be traveling for my next injection. How do I make sure to get my Theryx when I’m away?',
        },
        {
          type: 'to',
          content: 'I can help you with that where will you be traveling? Also how are you doing?',
        },
        {
          type: 'from',
          content: 'I’m going to be traveling for my next injection. How do I make sure to get my Theryx when I’m away?',
        },
        {
          type: 'to',
          content: 'I can help you with that where will you be traveling? Also how are you doing?',
        },
        {
          type: 'from',
          content: 'I’m going to be traveling for my next injection. How do I make sure to get my Theryx when I’m away?',
        },
        {
          type: 'to',
          content: 'I can help you with that where will you be traveling? Also how are you doing?',
        }
      ]
    }
  }
}

export { initialState }
