import React from 'react';
import Bullets from './Bullets';
import ViewMoreLess from '../../../components/commons/ViewMoreLess';

const listOne = [
  'Wants to know how things work',
  'Wants to be accurate, have accuracy with others',
  'Values numbers, stats, ideas',
  'Loves details',
  'Fears being embarrassed or losing face',
  'Often introverted and hide feelings',
];

const listTwo = [
  'Be systematic, thorough, deliberate, and precise Focus on the task',
  'Be prepared to answer many “how” questions Provide analysis and facts',
  'Don’t get too personal',
  'Recognize and acknowledge the need to be accurate and logical Don’t rush unnecessarily',
  'Expect to repeat yourself Allow time for evaluation Use lots of evidence',
  'Compliment the precision and accuracy of the completed work',
];

const TheAnalytical = () => {
  return (
    <div className="text-left">
      <p>
        The Analytical is polite but reserved, logical, fact- and task-oriented.
        This person’s focus is on precision and perfection. Other strengths
        include persistence, diligence, caution, and a systematic approach.{' '}
      </p>
      <p className="mb-2">
        Weaknesses involve being withdrawn, boring, quiet, reclusive, and even
        sullen at times. If he or she seems indecisive, it’s because of a need
        to assess all the data. Perfectionism can be a fault if the Analytical
        pushes it too far. This person is definitely not a risk-taker.{' '}
      </p>
      <ViewMoreLess>
        <>
          <p>
            The Analytical needs to be right and won’t openly discussing ideas
            until confident in a decision. His or her pleasure is accuracy. Pain
            is to be wrong and criticized.
          </p>

          <Bullets list={listOne} />

          <p>When communicating with an Analytical:</p>

          <Bullets list={listTwo} />

          <p className="font-weight-semi-bold mb-0">
            Portrait of an Analytical’s office
          </p>

          <p className="mb-2">
            The first thing you notice will probably be the glasses. The
            Analytical will have worn out his or her eyes from constantly
            reading everything. On the wall you may see a framed degree, but the
            chief decoration will be charts, figures, and graphs of every kind.
            The analytical is not very friendly, will often greet you
            skeptically, and doesn’t want to share much – especially anything
            personal. There will be no flowers or plant; for the Analytical,
            they belong in greenhouses. On the desk will be only
            business-related information, and that will be carefully arranged.
            It’s not a power office, but it definitely will be functional. As
            for color, black and white will do nicely.
          </p>
        </>
      </ViewMoreLess>
    </div>
  );
};
export default TheAnalytical;
