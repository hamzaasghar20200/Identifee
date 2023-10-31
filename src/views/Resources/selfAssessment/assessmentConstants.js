import driverIcon from '../../../assets/svg/self-assessment/the_driver_icon.png';
import driverVideoBanner from '../../../assets/svg/self-assessment/the_driver.png';
import amiableIcon from '../../../assets/svg/self-assessment/the_amiable_icon.png';
import amiableVideoBanner from '../../../assets/svg/self-assessment/the_amiable.png';
import analyticalIcon from '../../../assets/svg/self-assessment/the_analytical_icon.png';
import analyticalVideoBanner from '../../../assets/svg/self-assessment/the_analytical.png';
import expressiveIcon from '../../../assets/svg/self-assessment/the_expressive_icon.png';
import expressiveVideoBanner from '../../../assets/svg/self-assessment/the_expressive.png';
import overviewBanner from '../../../assets/svg/self-assessment/the_overview.png';
import TheExpressive from './TheExpressive';
import TheAnalytical from './TheAnalytical';
import TheAmiable from './TheAmiable';
import TheDriver from './TheDriver';

export const COMMUNICATION_STYLES = {
  Driver: {
    id: 1,
    title: 'The Driver',
    description: 'Communicating with a Driver/Action oriented person',
    icon: driverIcon,
    points: [
      'Focus on the results first; state the conclusion at the outset.',
      'State your best recommendation; do not offer many alternatives.',
      'Be as brief as possible.',
      'Emphasize the practicality of your ideas.',
      'Use visual aids.',
    ],
    details: <TheDriver />,
    video: {
      poster: driverVideoBanner,
      playId: 'A24NVBjIdYhXKsnjyMqpYuxMCH01P5g01gIuAWHOcTnk00',
      videoId: 'a48b52b8-6ad2-4e21-85d0-3cb2a7fb1e8f',
      muxUploadId: 'GnDHpiuh00O3kODH3yYqyIoC2QtkiSVlLUctXHKC7eB4',
      muxUploadUrl:
        'https://storage.googleapis.com/video-storage-gcp-us-east4-vop1-uploads/RGTLbpPJHPzQqRfzMjKcaH?Expires=1677662105&GoogleAccessId=uploads-gcp-us-east1-vop1%40mux-video-production.iam.gserviceaccount.com&Signature=lQiQPJFpwfNZiFTFPCibAZPp7qsUmbtDHp%2BsY7KNszO8pgVdbqREto1iYcfVIA%2Baax9lqepciNKFaK%2FiuKdMXJ3Fy0HeGkg0vuvu2K0UO154JRzFG8R4UuMd%2BCNVtyDkh3ZX3lFBwlwSsNK4AwhxevScu6pzRd5%2B3RSBnMLI8M5NfECByZT5souKYXD3G8xgpcW%2FqO9%2FAiJ5fnyryjGXZpkb%2BDmpIU6%2FCTq6RoKw7LiKHCo3KONMnhRMTdNWKW0iFsaObcSXK%2BYkX92f1GAGkJ4S23JCnA0qKQjcY6qecz6RDSJBxYM9fvI5kwsoab4uW1t7qNxmFc09ShpWRoiNbg%3D%3D&upload_id=ADPycdu7LpjAgMXrPFn2e3YB7qPBBvNB7JLobVZbFx3Y_f9KXGPuTS5FNMQrdKZTYUU_-Yp5MK6ziFG70d9WIp3NSmAKYg',
    },
  },
  Amiable: {
    id: 2,
    title: 'The Amiable',
    description: 'Communicating with a People/Amiable oriented person',
    icon: amiableIcon,
    points: [
      'Allow for small talk; do not start the discussion right away.',
      'Stress the relationship between your proposal and the people concerned.',
      'Show how the ideas worked well in the past.',
      'Indicate support from well-respected people.',
      'Use an informal writing style.',
    ],
    details: <TheAmiable />,
    video: {
      poster: amiableVideoBanner,
      playId: 'ypKiPKCwQVkUS02M20145FN6gHdeEUjPLljub7AX2MZgk',
      videoId: '909d5e56-e638-4fca-9c8e-07421d5ffd01',
      muxUploadId: '002BSWJ021mFCblqZM7M02MhYW7K6oCCgTvKiNC5zXIES4',
      muxUploadUrl:
        'https://storage.googleapis.com/video-storage-gcp-us-east1-vop1-uploads/D5o8aofY5Wfe1a20sPN7AW?Expires=1677662179&GoogleAccessId=uploads-gcp-us-east1-vop1%40mux-video-production.iam.gserviceaccount.com&Signature=qK%2FhziA2%2Bjckkn5OvvY4B30jKvW6wq0lUKv%2BN72%2FjkFoBhGxieVGiL12IwEq7MUUEQA8Yn%2Fpp03DkiSSmFaeuwBoHEGn72dFpJu8p9IDkmavTohYGdHr5mrqPwkStjiTtUkJ5yLhSbGm1krRozTse3rXX2uIm%2FcmKnDX4hrW2tyqPMU6VeidKuCoXMgDMfKMi03uuZplvMguh0s1b3ElAISUQjAh7XIME7%2BDh1jZvTPT1%2FKBiOf9%2BbmsQkf%2FoK85CRLKfOIOR4MdB8zk4n93Avv%2BCk1KR7B8S8YABfB%2BplOLM7wnRMuqdYRkBB9bQan7I4XnnHECmkJ9QcuLK6nEPA%3D%3D&upload_id=ADPycdt8DT_1zA6Ma8pQsq4ej-z4_K3PbYSHLf9DjJ2pNtKVZzAEfmI969qle0DU86sEiV9Hq6GLEYUzo38vl2YjvhGyvw',
    },
  },
  Analytical: {
    id: 3,
    title: 'The Analytical',
    description: 'Communicating with a Process/Analytical oriented person',
    icon: analyticalIcon,
    points: [
      'Be precise; state the facts',
      'Organize your discussions in a logical order:',
      '<ul class="ml-4"><li><p class="mb-2">Background</p></li><li><p class="mb-2">Present situation</p></li><li><p class="mb-2">Outcome</p></li></ul>',
      'Break down your recommendations.',
      'Include options and alternatives with pros and cons.',
      'Do not rush a process-orientated person',
      'Outline your proposal.',
    ],
    details: <TheAnalytical />,
    video: {
      poster: analyticalVideoBanner,
      playId: 'gx5jYvAAmnwkk00Z5VWa6HLzhlU751keWoNwMQFX8i2E',
      videoId: '5c766b4f-8aef-4355-8bce-3fd7c7c1950e',
      muxUploadId: 'sdfzIeKtlP3Ih7T800624uMHhIRd5kCqvm1dZpi00wJrs',
      muxUploadUrl:
        'https://storage.googleapis.com/video-storage-gcp-us-east1-vop1-uploads/34krZ4v2q1k39AZbwHHEOD?Expires=1677662283&GoogleAccessId=uploads-gcp-us-east1-vop1%40mux-video-production.iam.gserviceaccount.com&Signature=JVlLqKolQzzXcrwP2bd68U18%2FNB7ilKxU2fkOvJLy7Km3I%2BnuJBvJJQeBzLFVJWwjf41SVE7njKhyoJ3LfRPcb%2FkcEvTKQKdiLReNFWSa5DbA5m7tEtAl8wLCo75hqKIf%2BMI5PvzLlXvgXcng4XdTHsRhK2P1tHT7WPd%2FK7daIQfFbyUSrbYB31tqCL8s5mI1bqegkXAb5M48JTLkjj0KxO6O%2FvX4jHvHBXBJ%2FP7ldPd1sWY5rU9DRnyF7sikoEXYpQBCITQHl4xa177MRDjs2KbY6odrVKESBLx5kf%2FPW6iSM%2FmUYc%2FInpbVrJq1uEds7eg4b7fx%2FbthwfNSW%2BisA%3D%3D&upload_id=ADPycdvLKMsQE2bu3Ra9czScIqeClJbv2dzUfmQTpFYB2DReJvKqSs79iJoD3ZQh4V9Zbny7S98GilE4OdtcQureiaAGBA',
    },
  },
  Expressive: {
    id: 4,
    title: 'The Expressive',
    description: 'Communicating with a Idea/Expressive oriented person',
    icon: expressiveIcon,
    points: [
      'Allow enough time for discussion.',
      'Do not get impatient when he or she goes off on tangents.',
      'Try to relate the discussed topic to a broader concept or idea.',
      'Stress the uniqueness of the idea or topic at hand.',
      'Emphasize future value or relate the impact of the idea to the future.',
      'If writing, try to stress the key concepts that underlie your recommendation at the outset. Start with an overall statement and work toward the particulars.',
    ],
    details: <TheExpressive />,
    video: {
      poster: expressiveVideoBanner,
      playId: 'flxOx4hGujZsMxIKn7kZGU1r7Y98vKQNTlqeMwfOEIw',
      videoId: 'a546e0f5-1274-4bb6-a3f1-db457e64787c',
      muxUploadId: '8OAmmTxwDA8YNg8bUfi4kkj5zRMbErK59S02CHDm1uro',
      muxUploadUrl:
        'https://storage.googleapis.com/video-storage-gcp-us-east4-vop1-uploads/3faQUOwUARpZo6cX1cN5eL?Expires=1677662011&GoogleAccessId=uploads-gcp-us-east1-vop1%40mux-video-production.iam.gserviceaccount.com&Signature=VrpHuUCQhKWRLja%2BRoH%2BqW2DIGqr1iLtC9wfrhzufGKkYgUBMyiog%2BbNS4kjRWmvcqz6y292ED0Jyc0391O4nw9WysAd%2Baf85IG63DVmUnQEpTuAxO2Z%2F9R3S5G%2BBbkTk3J1sbz4UnyePh4MU8PS6xaL04%2FZviofYi3BeWW5Tu2YlzhGluVJpJSMUB8M58lVFS5cqxKHEojttjWHzFJ1rUS9%2FIiLTyAkBRkNP8AotAKfmglcxKda23b31hQI8HdN9AF4oQCu8r2eGVPx9gRAQhDuE56xr74ShTPppFztV2rzmvVlZMdqjdaScbfA4ZSRYitaxRpnkx%2FhdR6%2FOP%2FTug%3D%3D&upload_id=ADPycdvgBLJwgsSODzEDYmcY_1DBJCfjkDFjyLQMkRmaaPD5aj-ySguEOOaEiVzKNJhXLtqnxE_kv0lGpiR9p_q3t7g2SA',
    },
  },
};

export const AssessmentOverview = {
  id: 1,
  video: {
    poster: overviewBanner,
    playId: '9ZXbdOHWAToagSsX7y9v01Ol98gzmGM1ZnJUHFblzzNE',
    videoId: '3e0ca780-c041-41bd-bfd2-3ba04017d10b',
    muxUploadId: 'Mt2AVSZWoLfeKmnboNQV2ov02HYojX4TFLfWwEwuDAS4',
    muxUploadUrl:
      'https://storage.googleapis.com/video-storage-gcp-us-east4-vop1-uploads/7xHzaszVdeM5lkV4UC7RaC?Expires=1677661869&GoogleAccessId=uploads-gcp-us-east1-vop1%40mux-video-production.iam.gserviceaccount.com&Signature=eXprJuWWDb1qIALgHMOIVqD0WWv7xOu7Qsvs3bbCimb4DahoI3yZAm0DblgdgUnJ8%2FtyFpDsdkYxVZgV0so9jsQIMeANd3Zrkssu3rJHxnGf9LNhQzMTNmf4rdjwX5bRflVFd4eyeSeHr7P57PbXJVHM%2Fd6boAsercneTpbJWWFS4xNmEh9BGe2V%2FXfzNwJSDNq2Nc0yrcPQNelObsJ1LvI8T%2BH1Y%2BofetSPTC2AvVxhy%2BVs3%2FLvey0wDMDfYPCBkiRkiCctkpQEo%2F50dXuzQofYyUZafJKQ3NqvCdwgYT5s5HRFC%2Bu3kn0XiU7f%2ByASBSd%2BvjoWHXNPl7%2BTKpu%2FoA%3D%3D&upload_id=ADPycds5oqOG-FHHnp-Nhxnpntsd67ze9pBvQj0qYkcJ_4HRA1zz69AdnVyUQWB5Exs65Nuf-OSCA6VX_7IyqpUUhU91ob5cOf7m',
  },
};

export const SelfAssessmentTypes = {
  Private: 'private',
  Public: 'public',
  Both: 'both',
};

export const PersonalityTypes = {
  Amiable: 'amiable',
  Analytical: 'analytical',
  Driver: 'driver',
  Expressive: 'expressive',
};
