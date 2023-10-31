import LessonsStartedCompleted from './LessonsStartedCompleted';
import PopularLessons from './PopularLessons';
import DealsPerformance from './DealsPerformance';
// TODO fix these reports after deal_stage update
// import DealsProgress from './DealsProgress';
// import DealsConversion from './DealsConversion';
// import DealsDuration from './DealDuration';
import ActiveTrainingUsers from './ActiveTrainingUsers';
import UserStatisticsLesson from './UserStatisticsLesson';
import UserStatisticsCourse from './UserStatisticsCourse';
import LessonsPending from './LessonsPending';
import LessonAttempts from './LessonAttempts';
import TrainingsCompleted from './TrainingsCompleted';
import TopLessons from './TopLessons';
import ActiveLessons from './ActiveLessons';
import ActiveCourses from './ActiveCourses';
import CourseStatistics from './CourseStatistics';
import LessonStatistics from './LessonStatistics';
import CategoryAttempts from './CategoryAttempts';
import SelfAssessment from './SelfAssessment';
import {
  InsightsTable,
  InsightsTableFilters,
  InsightsTableFiltersLesson,
  InsightsTableFiltersLessonByUser,
  InsightsTableFiltersCourseByUser,
} from './components';
import CourseProgressReport from './CourseProgressReport';
import LessonProgressReport from './LessonProgressReport';
import LessonProgressByUser from './LessonProgressByUser';
import CourseProgressByUser from './CourseProgressByUser';
import DealPipelineReport from './DealPipelineReport';
import DealsProgressReport from './DealsProgressReport';
import DealAgingReport from './DealAgingReport';
import ProductPerformanceReport from './ProductPerformanceReport';
import SalesTeamReport from './SalesTeamReport';
import DealConversionRateReport from './DealConversionRateReport';
import SalesFunnelReport from './SalesFunnelReport';
import SalesActivityReport from './SalesActivityReport';
import SalesForecastReport from './SalesForecastReport';
import SalesPerformanceReport from './SalesPerformanceReport';

const ACTIVE_TRAINING_USERS = 'Active Training Users';
const CATEGORY_ATTEMPTS = 'Category Attempts';
const DEALS_PERFORMANCE = 'Deals Performance';
const LESSON_ATTEMPTS = 'Lesson Attempts';
const USER_STATE_LESSON = 'Users by Lesson';
const USER_STATE_COURSE = 'Users by Course';
const LESSONS_STARTED_AND_COMPLETED = 'Lessons Started and Completed';
const LESSONS_PENDING = 'Lessons Pending';
const POPULAR_LESSONS = 'Popular Lessons';
const TRAININGS_COMPLETED = 'Trainings Completed';
const TOP_LESSONS = 'Top Lessons';
const ACTIVE_LESSONS = 'Active Lessons';
const ACTIVE_COURSES = 'Active Courses';
const COURSE_STATISTICS = 'Course Statistics';
const LESSON_STATISTICS = 'Lesson Statistics';
const COURSE_PROGRESS_REPORT = 'Course Progress Report';
const LESSON_PROGRESS_REPORT = 'Lesson Progress Report';
const COURSE_PROGRESS_BY_USER = 'Course Progress by User';
const LESSON_PROGRESS_BY_USER = 'Lesson Progress by User';
const SELF_ASSESSMENT = 'Self Assessment';

export const processableExamples = {
  'Top 25 Users by Lessons Completed - Last 90 Day': ACTIVE_TRAINING_USERS,
  'Top 25 Categories by Lessons Attempted - Last 90 Day': CATEGORY_ATTEMPTS,
  // 'Count of Deals by Status - Last 6 Months': DEALS_PERFORMANCE,
  'Top 25 Lessons Attempted - Last 90 Day': LESSON_ATTEMPTS,
  'Users by Lesson': USER_STATE_LESSON,
  'Users by Course': USER_STATE_COURSE,
  'Course Statistics': COURSE_STATISTICS,
  'Lesson Statistics': LESSON_STATISTICS,
  'Daily Lesson Completion Rate - Last 7 Day': LESSONS_STARTED_AND_COMPLETED,
  'Top 25 Lessons in Progress - Last 90 Day': LESSONS_PENDING,
  'Top Categories by Lesson Progress': POPULAR_LESSONS,
  'Top 25 Lessons Completed - Last 90 Day': TRAININGS_COMPLETED,
  'Top 25 Lessons In Progress - Last 90 Day': TOP_LESSONS,
  'Course Progress Report': COURSE_PROGRESS_REPORT,
  'Lesson Progress Report': LESSON_PROGRESS_REPORT,
  'Course Progress by User': COURSE_PROGRESS_BY_USER,
  'Lesson Progress by User': LESSON_PROGRESS_BY_USER,
  'Active Lessons': ACTIVE_LESSONS,
  'Active Courses': ACTIVE_COURSES,
  'Self Assessment': SELF_ASSESSMENT,
  'Deal Pipeline Report': 'Deal Pipeline Report',
  'Deals Progress Report': 'Deals Progress Report',
  'Deal Aging Report': 'Deal Aging Report',
  'Product Performance Report': 'Product Performance Report',
  'Sales Team Report': 'Sales Team Report',
  'Deal Conversion Rate Report': 'Deal Conversion Rate Report',
  'Sales Funnel Report': 'Sales Funnel Report',
  'Sales Activity Report': 'Sales Activity Report',
  'Sales Forecast Report': 'Sales Forecast Report',
  'Sales Performance Report': 'Sales Performance Report',
};

export const SwitchAllReports = (props) => {
  if (props.insightName === LESSONS_STARTED_AND_COMPLETED) {
    return <LessonsStartedCompleted {...props} />;
  } else if (props.insightName === POPULAR_LESSONS) {
    return <PopularLessons {...props} />;
  } else if (props.insightName === COURSE_PROGRESS_REPORT) {
    return <InsightsTableFilters {...props} render={CourseProgressReport} />;
  } else if (props.insightName === LESSON_PROGRESS_REPORT) {
    return (
      <InsightsTableFiltersLesson {...props} render={LessonProgressReport} />
    );
  } else if (props.insightName === LESSON_PROGRESS_BY_USER) {
    return (
      <InsightsTableFiltersLessonByUser
        {...props}
        render={LessonProgressByUser}
      />
    );
  } else if (props.insightName === COURSE_PROGRESS_BY_USER) {
    return (
      <InsightsTableFiltersCourseByUser
        {...props}
        render={CourseProgressByUser}
      />
    );
  }

  let render;
  switch (props.insightName) {
    case ACTIVE_TRAINING_USERS:
      render = ActiveTrainingUsers;
      break;
    case CATEGORY_ATTEMPTS:
      render = CategoryAttempts;
      break;
    case DEALS_PERFORMANCE:
      render = DealsPerformance;
      break;
    case LESSON_ATTEMPTS:
      render = LessonAttempts;
      break;
    case USER_STATE_LESSON:
      render = UserStatisticsLesson;
      break;
    case USER_STATE_COURSE:
      render = UserStatisticsCourse;
      break;
    case LESSONS_PENDING:
      render = LessonsPending;
      break;
    case TOP_LESSONS:
      render = TopLessons;
      break;
    case ACTIVE_LESSONS:
      render = ActiveLessons;
      break;
    case ACTIVE_COURSES:
      render = ActiveCourses;
      break;
    case COURSE_STATISTICS:
      render = CourseStatistics;
      break;
    case LESSON_STATISTICS:
      render = LessonStatistics;
      break;
    case TRAININGS_COMPLETED:
      render = TrainingsCompleted;
      break;
    case COURSE_PROGRESS_REPORT:
      render = CourseProgressReport;
      break;
    case SELF_ASSESSMENT:
      render = SelfAssessment;
      break;
    case processableExamples['Deal Pipeline Report']:
      render = DealPipelineReport;
      break;
    case processableExamples['Deals Progress Report']:
      render = DealsProgressReport;
      break;
    case processableExamples['Deal Aging Report']:
      render = DealAgingReport;
      break;
    case processableExamples['Product Performance Report']:
      render = ProductPerformanceReport;
      break;
    case processableExamples['Sales Team Report']:
      render = SalesTeamReport;
      break;
    case processableExamples['Deal Conversion Rate Report']:
      render = DealConversionRateReport;
      break;
    case processableExamples['Sales Funnel Report']:
      render = SalesFunnelReport;
      break;
    case processableExamples['Sales Activity Report']:
      render = SalesActivityReport;
      break;
    case processableExamples['Sales Forecast Report']:
      render = SalesForecastReport;
      break;
    case processableExamples['Sales Performance Report']:
      render = SalesPerformanceReport;
      break;
  }

  if (!render) {
    return;
  }

  return <InsightsTable {...props} render={render} />;
};
