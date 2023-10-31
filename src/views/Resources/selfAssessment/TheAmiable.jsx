import Bullets from './Bullets';
import React from 'react';
import ViewMoreLess from '../../../components/commons/ViewMoreLess';

const listOne = [
  'Wants to know “why” why I am doing this',
  'Wants to build relationships',
  'Loves to give support to others',
  'Values suggestions for others',
  'Fears losing trust or having disagreements',
  'Tend to display emotions.',
  'Often introverts thought',
];

const listTwo = [
  'Be relaxed and agreeable',
  'Maintain the status quo',
  'Be logical and systematic',
  'Create a plan with written guidelines',
  'Be prepared to answer “why” questions',
  'Be predictable',
  'Agree clearly and often',
  'Use the word “we”',
  'Don’t push, Don’t rush',
  'Compliment him or her as a team player; Be a good listener',
];
const TheAmiable = () => {
  return (
    <div className="text-left">
      <p>
        Devoted, consistent, dependable, and loyal,the Amiable is a hard worker
        and will persevere long after others have given up. He or she is a team
        player, cooperative and easy to get along with, trustful, sensitive and
        a good listener. Working in groups with cooperative individuals, the
        Amiable tries to avoid confrontation. He or she enjoys company, performs
        best in a stable environment, and often has a stabilizing effect on
        others.
      </p>
      <p className="mb-2">
        Weaknesses include indecision and an inability to take risks. Amiables
        are often too focused on others, conforming, quiet, and passive. They
        often won’t speak up for themselves, are too compliant and nice, and
        often painstakingly slow to make decisions.
      </p>
      <ViewMoreLess>
        <>
          <p>
            The Amiable’s pleasure is stability and cooperation. His or her pain
            is change and chaos.
          </p>
          <Bullets list={listOne} />
          <p>When communicating with an Amiable:</p>
          <Bullets list={listTwo} />
          <p className="font-weight-semi-bold mb-0">
            Portrait of an Amiable’s office
          </p>
          <p className="mb-2">
            The first thing you will notice will be pictures of loved ones on
            the desk: husband, wife, family, favorite pets. They’ll be in a
            candid style, and the Amiable loves to talk about them. On the walls
            will be colorful photos of landscapes, waterfalls, birds, and
            sunsets. You’ll find flowers or plants that are growing well and
            office colors that are harmonious and restful. The person will
            almost certainly be dressed in colors that match. Furniture will be
            fashionable, but not overwhelming. Files are present, but usually
            kept out of the way. If you’re a little late, the Amiable won’t
            mind. If you have the Amiable in your company, he or she will stay
            with you. The Amiable likes company, newsletters, picnics,
            gatherings, and retirement parties.
          </p>
        </>
      </ViewMoreLess>
    </div>
  );
};
export default TheAmiable;
