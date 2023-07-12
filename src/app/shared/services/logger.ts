const logger: any = console as Console;
const INIT_ACTION = '@ngrx/store/init';

const repeat = (str: any, times: any) => new Array(times + 1).join(str);
const pad = (num: any, maxLength: any) =>
  repeat(`0`, maxLength - num.toString().length) + num;
const formatTime = (time: any) =>
  `@ ${pad(time.getHours(), 2)}:${pad(time.getMinutes(), 2)}:${pad(
    time.getSeconds(),
    2
  )}.${pad(time.getMilliseconds(), 3)}`;
const timer =
  typeof performance !== `undefined` && typeof performance.now === `function`
    ? performance
    : Date;

const getLogLevel = (level: any, action: any, payload: any, type: any) => {
  switch (typeof level) {
    case `object`:
      return typeof level[type] === `function`
        ? level[type](...payload)
        : level[type];
    case `function`:
      return level(action);
    default:
      return level;
  }
};

const printBuffer = (options: any) => (logBuffer: any) => {
  const {
    actionTransformer,
    collapsed,
    colors,
    timestamp,
    duration,
    level
  } = options;
  logBuffer.forEach((logEntry: any, key: any) => {
    const { started, startedTime, action, error } = logEntry;
    const prevState = logEntry.prevState.nextState
      ? logEntry.prevState.nextState
      : '(Empty)';
    let { took, nextState } = logEntry;
    const nextEntry = logBuffer[key + 1];
    if (nextEntry) {
      nextState = nextEntry.prevState;
      took = nextEntry.started - started;
    }

    const formattedAction = actionTransformer(action);
    const isCollapsed =
      typeof collapsed === `function`
        ? collapsed(() => nextState, action)
        : collapsed;

    const formattedTime = formatTime(startedTime);
    const titleCSS = colors.title
      ? `color: ${colors.title(formattedAction)};`
      : null;
    const title = `action ${timestamp ? formattedTime : ``} ${
      formattedAction.type
    } ${duration ? `(in ${took.toFixed(2)} ms)` : ``}`;

    try {
      if (isCollapsed) {
        if (colors.title) logger.groupCollapsed(`%c ${title}`, titleCSS);
        else logger.groupCollapsed(title);
      } else {
        if (colors.title) logger.group(`%c ${title}`, titleCSS);
        else logger.group(title);
      }
    } catch (e) {
      logger.log(title);
    }

    const prevStateLevel = getLogLevel(
      level,
      formattedAction,
      [prevState],
      `prevState`
    );
    const actionLevel = getLogLevel(
      level,
      formattedAction,
      [formattedAction],
      `action`
    );
    const errorLevel = getLogLevel(
      level,
      formattedAction,
      [error, prevState],
      `error`
    );
    const nextStateLevel = getLogLevel(
      level,
      formattedAction,
      [nextState],
      `nextState`
    );

    if (prevStateLevel) {
      if (colors.prevState)
        logger[prevStateLevel](
          `%c prev state`,
          `color: ${colors.prevState(prevState)}; font-weight: bold`,
          prevState
        );
      else logger[prevStateLevel](`prev state`, prevState);
    }

    if (actionLevel) {
      if (colors.action)
        logger[actionLevel](
          `%c action`,
          `color: ${colors.action(formattedAction)}; font-weight: bold`,
          formattedAction
        );
      else logger[actionLevel](`action`, formattedAction);
    }

    if (error && errorLevel) {
      if (colors.error)
        logger[errorLevel](
          `%c error`,
          `color: ${colors.error(error, prevState)}; font-weight: bold`,
          error
        );
      else logger[errorLevel](`error`, error);
    }

    if (nextStateLevel) {
      if (colors.nextState)
        logger[nextStateLevel](
          `%c next state`,
          `color: ${colors.nextState(nextState)}; font-weight: bold`,
          nextState
        );
      else logger[nextStateLevel](`next state`, nextState);
    }

    try {
      logger.groupEnd();
    } catch (e) {
      logger.log(`—— log end ——`);
    }
  });
  logBuffer.length = 0;
};

const isAllowed = (action: any, filter: any) => {
  if (!filter) {
    return true;
  }
  if (filter.whitelist && filter.whitelist.length) {
    return filter.whitelist.indexOf(action.type) !== -1;
  }
  return filter.blacklist && filter.blacklist.indexOf(action.type) === -1;
};

export const storeLogger = (opts: LoggerOptions = {}) => (
  reducer: Function
) => {
  let log = {};
  const ua =
    typeof window !== 'undefined' && window.navigator.userAgent
      ? window.navigator.userAgent
      : '';
  let ms_ie = false;
  //fix for action display in IE
  const old_ie = ua.indexOf('MSIE ');
  const new_ie = ua.indexOf('Trident/');

  if (old_ie > -1 || new_ie > -1) {
    ms_ie = true;
  }

  let colors: LoggerColorsOption;
  if (ms_ie) {
    // Setting colors functions to null when it's an IE browser.
    colors = {
      title: () => '',
      prevState: () => '',
      action: () => '',
      nextState: () => '',
      error: () => '',
    };
  } else {
    colors = {
      title: () => '',
      prevState: () => '#9E9E9E',
      action: () => '#03A9F4',
      nextState: () => '#4CAF50',
      error: () => '#F20404'
    };
  }

  const defaults: LoggerOptions = {
    level: 'log',
    collapsed: false,
    duration: true,
    timestamp: true,
    stateTransformer: state => state,
    actionTransformer: actn => actn,
    filter: {
      whitelist: [],
      blacklist: []
    },
    colors: colors
  };

  const options = Object.assign({}, defaults, opts);
  const { stateTransformer } = options;
  const buffer = printBuffer(options);

  return function(state: any, action: any) {
    let preLog = {
      started: timer.now(),
      startedTime: new Date(),
      prevState: stateTransformer ? stateTransformer(log) : null,
      action
    };

    let nextState = reducer(state, action);

    let postLog = {
      took: timer.now() - preLog.started,
      nextState: stateTransformer ? stateTransformer(nextState) : null,
    };
    log = Object.assign({}, preLog, postLog);
    //ignore init action fired by store and devtools
    if (action.type !== INIT_ACTION && isAllowed(action, options.filter)) {
      buffer([log]);
    }

    return nextState;
  };
};

export interface LoggerOptions {
  level?: 'log' | 'console' | 'warn' | 'error' | 'info';
  collapsed?: boolean;
  duration?: boolean;
  timestamp?: boolean;
  filter?: LoggerFilterOption;
  stateTransformer?: (state: any) => any;
  actionTransformer?: (action: any) => any;
  colors?: LoggerColorsOption;
}

export interface LoggerFilterOption {
  whitelist?: string[];
  blacklist?: string[];
}

export interface LoggerColorsOption {
  title: (action: any) => string;
  prevState: (prevState: any) => string;
  action: (action: any) => string;
  nextState: (nextState: any) => string;
  error: (error: any, prevState: any) => string;
}
