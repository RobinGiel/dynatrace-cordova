import { UserPrivacyOptions } from "../model/UserPrivacyOptions";

/**
 * Signature of the function passed as callback in [[addLeaveActionListener]]
 *
 * @name ActionLeaveListener
 * @public
 * @param {number} actionId the id for which the leave is called
 * @param {number} actionTime start resp. endtime of the action
 * @param  {ListenerOptions} options? [[ListenerOptions]]
 * @param isRootAction
 */
type ActionLeaveListener = (actionId: number, time: number, isRootAction: boolean) => void;
/**
 * Signature of the function passed as callback in [[addEnterActionListener]]
 *
 * @param {number} actionId the id for which the enter is called
 * @param {number} actionTime start resp. endtime of the action
 * @param  {EventTarget|string} element? the element which resulted in the initiation of the event
 */
type ActionEnterListener = (actionId: number, time: number, isRootAction: boolean, element?: EventTarget | string) => void;

/**
 * 0 .. just extend running ajax actions
 * 1 .. extend any running action
 * 2 .. extend any running action - visible subaction
 * 3 .. start action if user input is present
 */
declare const enum XhrActionMode {
    EXTEND_AJAX_ACTION = 0,
    EXTEND_ACTION = 1,
    EXTEND_ACTION_VISIBLE_SUBACTION = 2,
    CREATE_ACTION_WITH_USER_INPUT = 3
}
type PageLeaveListener = (unloadRunning: boolean) => void;

declare const enum DoNotDetectFlags {
    CLICK = 'clk',
    MOUSEDOWN = 'mdw',
    MOUSEUP = 'mup',
    DOUBLECLICK = 'dcl',
    KEYDOWN = 'kyd',
    KEYUP = 'kyu',
    SCROLL = 'scr',
    TOUCHSTART = 'tcs',
    TOUCHEND = 'tce',
    CHANGE = 'chg'
}

type AllowedMapTypes = string | number | Date;

interface SessionPropertyMap<S extends AllowedMapTypes> {
    [key: string]: S;
}

interface MetaData {
    /**
     * An internally used id
     * @hidden
     */
    id: string;
    /**
     * Specifies where the metadata is collected from:
     * * CSS Selector
     * * JavaScript Variable
     * * Cookie
     */
    type: string;
    /**
     * How the metadata can be retrieved(cookie name, css selector, javascript variable name)
     */
    expression: string;
    /**
     * The current value for the given expression
     */
    value: string;
}

interface DtRumUserInput {
    target?: EventTarget | string;
    name: string;
    info: string;
    title: string;
}

interface DtrumApi {
    /**
     * Enables/disables automatic action detection.
     *
     * @param enabled whether automatic action detection should be enabled or disabled
     */
    setAutomaticActionDetection(enabled: boolean): void;
    /**
     * Tells the js agent to not automatically detect load end. Load start and load end must be set explicitly via signalLoadEnd.
     * This function must be called immediately after the js agent script tag!
     *
     */
    setLoadEndManually(): void;
    /**
     * Signals that the page has finished loading
     *
     */
    signalLoadEnd(): void;
    /**
     * Reports the response code and an additional message for the current page to the server.
     * Needs to be called before the onload event has finished, otherwise the information will be discarded
     *
     * @param responseCode The response code of the current page
     * @param message an additional informational message
     * @returns false if the values were incorrect or the function has been called too late, true otherwise
     */
    markAsErrorPage(responseCode: number, message: string): boolean;
    /**
     * Reports the response code and an additional message for the current xhr action
     * Needs to be called before the xhr action is finished and all listeners have been invoked
     *
     * @param responseCode The response code of the current xhr action
     * @param message an additional informational message
     * @param parentActionId the optional actionId of the action to mark as failed. If it is not present, the currently open
     *          action is used
     * @returns false if the values were incorrect or the function has been called too late, true otherwise
     */
    markXHRFailed(responseCode: number, message: string, parentActionId?: number): boolean;
    /**
     * Force signal sending to make certain that actions aren't lost.
     *
     * @param forceSync Force synchronous sending of signal (if false, it'll be sent asynchronously)
     * @param sendPreview Force sending of preview signals which haven't been closed yet.
     * @param killUnfinished Kills unfinished actions and sends them immediately. Handle with care, actions might be inaccurate.
     */
    sendSignal(forceSync: boolean, sendPreview: boolean, killUnfinished: boolean): void;
    /**
     * Enter an action
     *
     * @param actionName name o action
     * @param actionType type
     * @param startTime timestamp in milliseconds. if null, current time is used.
     * @param sourceUrl source url for the action
     * @param sourceTitle source title for the action
     * @returns id of the created action
     */
    "enterAction"(actionName: string, actionType: string, startTime?: number, sourceUrl?: string, sourceTitle?: string): number;
    /**
     * Attach a listener that gets called while entering an action <br />
     * Remove listener if not needed or make sure to filter actions out if using [[addActionProperties]], to prevent sending
     * the same actionproperty for every action. See [[removeEnterActionListener]]
     * @param  listener a function that will be called when entering an action
     * @returns void
     */
    addEnterActionListener(listener: ActionEnterListener): void;
    /**
     * Remove an already attached enter action listener
     * @param  listenerId a
     * @returns void
     */
    removeEnterActionListener(listener: ActionEnterListener): void;
    /**
     * Leaves an action
     *
     * @param actionId id of the action to leave. must be the value returned by enterAction
     * @param stopTime timestamp in milliseconds
     * @param startTime optional start time in milliseconds (necessary if start time should be modified)
     */
    "leaveAction"(actionId: number, stopTime?: number, startTime?: number): void;
    /**
     * Attach a listener that gets called while leaving an action <br />
     * Remove listener if not needed or make sure to filter actions out if using [[addActionProperties]],
     * to prevent sending the same actionproperty for every action. See [[removeLeaveActionListener]]
     * @param  listener a function that will be called when leaving an action
     * @returns void
     */
    addLeaveActionListener(listener: ActionLeaveListener): void;
    /**
     * Remove an already attached leave action listener
     * @param  listenerId x
     * @returns void
     */
    removeLeaveActionListener(listener: ActionLeaveListener): void;
    /**
     * Adds custom action properties to an ongoing action.  <br />
     * Currently only accepts valid java long, java double (as a string representation), Date objects & short strings of
     * at most 100 characters. <br />
     * Similar to [[sendSessionProperties]]
     * To see the action properties in the UI make sure to configure them correctly(Application Settings).*
     * https://www.dynatrace.com/support/help/how-to-use-dynatrace/real-user-monitoring/setup-and-configuration/web-applications/additional-configuration/define-user-action-and-session-properties/
     *
     * @param parentActionId id of the action.
     * @param javaLong JSON object containing key value pairs of valid numbers. <br /> Value should be between
     *          range -9223372036854776000 & 9223372036854776000
     * @param date JSON object containing key value pairs of JavaScript date objects.<br />  Value should be JavaScript Date object
     * @param shortString JSON object containing key value pairs of strings.<br />  Value character count should be less
     *          than 100 characters
     * @param javaDouble JSON object containing key value pairs of valid floating point numbers.<br />
     * Value should be between range -1.7976931348623157e+308 & 1.7976931348623157e+308
     * @param timestamp x
     */
    addActionProperties(parentActionId: number, javaLong?: SessionPropertyMap<number>, date?: SessionPropertyMap<Date>,
        shortString?: SessionPropertyMap<string>, javaDouble?: SessionPropertyMap<number>): void;
    /**
     * Reports an error message
     *
     * @param error The error to be tracked. Any browser error object is supported, if error does not
     *  have a stacktrace, it will attempt to generate one.
     *  Alternatively you can create your own object to pass to this function, simply set the propertiesmessage",
     *  file",line",column" &stack" to the corresponding values and dynatrace will pick up the values. All values
     *   except message are optional.
     * @param parentActionId parent action id. if not passed or null, error is added to current action
     */
    reportError(error: Error, parentActionId?: number): void;
    /**
     * Identifies a user
     *
     * @param value - The value to name the user (e.g. a username, a userid, an email address...)
     */
    identifyUser(value: string): void;
    /**
     * Indicates the start of a third party resource
     *
     * @param type 'i'...image, 's'...script, 'c'... custom
     * @param url complete URL of resource
     */
    startThirdParty(type: 'i' | 's' | 'c', url: string): void;
    /**
     * Indicates stop of a third party resource
     *
     * @param url complete URL of resource (must match URL provided in startThirdParty)
     * @param success true if the resource was loaded successfully, false if not
     * @param start absolute start time in milliseconds. Optional. When parameter is not passed or <=0,
     *          time of startThirdParty call is used
     * @param stop absolute stop time in milliseconds. Optional. When parameter is not passed or <=0,
     *          time of stopThirdParty call is used
     */
    stopThirdParty(url: string, success: boolean, start?: number, stop?: number): void;
    /**
     * Adds a listener that is called when the user is leaving the page, but before the monitor signal is sent
     *
     * @param listener a function that will be called in case the user leaves the page
     */
    addPageLeavingListener(listener: PageLeaveListener): void;
    /**
     * Indicates the start of a user input. User inputs must always be stopped by calling endUserInput.
     *
     * if an xhr call or a page load happens it is checked if a user input is active. if yes, the user input is set to
     * have triggered the page action.
     *
     * @param domNode domnode which triggered the action (button, etc) is used for determining its caption
     * @param type type of action: 'click', 'keypress', 'scroll',...
     * @param addInfo additional info for user input such as key, mouse button, etc ('F5', 'RETURN',...)
     * @param validTime how long this userInput should be valid(in ms)
     * @returns an object containing all the information about the userInput
     */
    beginUserInput(domNode: HTMLElement, type: string, addInfo: string, validTime?: number): DtRumUserInput;
    /**
     * Ends a user input.
     *
     * @param userInputObject the user input object returned by beginUserInput
     */
    endUserInput(userInputObject: DtRumUserInput): void;
    /**
     * Initiate ajax call
     *
     * @param type optional additional info about type of xhr (eg framework name,etc)
     * @param xmode xhr action creation mode
     *          0 .. just extend running ajax actions
     *          1 .. extend any running action
     *          2 .. extend any running action - visible subaction
     *          3 .. start action if user input is present
     * @param xhrUrl url of the requested resource
     * @returns id of the XhrAction
     */
    enterXhrAction(type: string, xmode?: 0 | 1 | 2 | 3, xhrUrl?: string): number;
    /**
     * Indicates the end of an xhr action
     *
     * @param actionId id of the xhr Action
     * @param {number} [stopTime] The stop time of the xhr Action
     */
    leaveXhrAction(actionId: number, stopTime?: number): void;
    /**
     * Indicates that an xhr callback is active (eg. XMLHttpRequest onreadystatechange). This is necessary to automatically add
     * actions started during a callback as subactions. Xhr callback must be stopped by endXhrCallback
     *
     * @param actionId id of the action where callback belongs to
     */
    enterXhrCallback(actionId: number): void;
    /**
     * Indicates the end of an xhr callback.
     *
     * @param actionId id of the action where callback belongs to
     */
    leaveXhrCallback(actionId: number): void;
    /**
     * Indicates the start of a load action. Frameworks often have their own load callback functions
     * this can be used when framework starts load beforeDOMContentLoaded"
     *
     */
    signalOnLoadStart(): void;
    /**
     * Tells the JavaScript agent to wait for an additional call of signalOnLoadEnd.
     * When the last call of signalOnLoadEnd is performed theonload" action is closed.
     * Note: if this function is called, signalOnLoadEnd MUST be called afterwards to indicated the end of one load.
     *
     */
    incrementOnLoadEndMarkers(): void;
    /**
     * Indicates the end of a load action. needs incrementOnLoadEndMarkers to be called before.
     * When last signalOnLoadEnd is called, theonload" action is closed
     *
     */
    signalOnLoadEnd(): void;
    /**
     * Sets the actionName of the currently active Action
     *
     * @param actionName the new name for the currently active action
     * @param  {number} actionId? the action id under which the sub action will be added
     */
    actionName(actionName: string, actionId?: number): void;
    /**
     * Sends an endSession signal to the server, which will cause the session to end without waiting for a timeout
     * @param success callback used when the endSession is successful 
     * @param error callback used when the endSession is not successful 
     * @returns Status from if the endSession call was successful or not
     */
    endSession(success: any, error: any): number;
    /**
     * Returns the current time in milliseconds. It automatically chooses the most accurate way to determine the current time.
     *
     * @returns the current time in milliseconds
     */
    now(): number;
    /**
     * Cookie Opt-In only: Enables the JavaScript agent in case it was disabled via Cookie Opt-In setting.
     */
    enable(): void;
    /**
     * Cookie Opt-In only: Disables the JavaScript agent and removes Dynatrace cookies for Cookie Opt-In
     * mode in case dtrum.enable() has been called earlier
     */
    disable(): void;
    /**
     * Adds a listener to get triggered upon the creation of a new visit id
     * @param listener x
     */
    addVisitTimeoutListener(listener: (visitId: string, newVisitAfterTimeout: boolean) => void): void;
    /**
     * Enables session replay
     * @param ignoreCostControl allows to enable session replay despite cost control configuration
     */
    enableSessionReplay(ignoreCostControl: boolean): void;
    /**
     * Disables session replay
     */
    disableSessionReplay(): void;
    /**
     * get and evaluate meta-data for the page
     *
     * @returns array of metadata objects with configured ids, type, expression, and captured values
     */
    getAndEvaluateMetaData(): MetaData[];
    /**
     * Enables persistent values again. Only applies if 'disablePersistentValues' has been called previously.
     */
    enablePersistentValues(): void;
    /**
     * Removes all traces of persistent values and disables all functionality that would
     * recreate one. Note that this has to be called on every page, since it removes persistent agent data, including
     * the information that persistent data shouldn't be stored.
     * @param remember if true, this configuration state is persisted in local storage, so that it doesn't
     *  reset on each page load
     */
    disablePersistentValues(remember: boolean): void;
    /**
     * Adds method which will be called before diff action in session replay during recording.
     * @param method listener which will be called before diff action. Listener receives one argument
     * which is a string with diff. Listener also must return the diff string.
     */
    registerPreDiffMethod(method: (diff: string) => string): void;
    /**
     * Sends session properties on a beacon signal
     * currently only accepts valid java long, java double (as a string representation), Date objects & short strings of
     * at most 100 characters. <br />
     * Similar to [[addActionProperties]]
     * To see the session properties in the UI make sure to configure them correctly(Application Settings).
     * https://www.dynatrace.com/support/help/how-to-use-dynatrace/real-user-monitoring/setup-and-configuration/web-applications/additional-configuration/define-user-action-and-session-properties/
     *
     * @param javaLong JSON object containing key value pairs of valid numbers. <br /> Value should be between
     *          range -9223372036854776000 & 9223372036854776000
     * @param date JSON object containing key value pairs of JavaScript date objects.<br />  Value should be JavaScript Date object
     * @param shortString JSON object containing key value pairs of strings.<br />  Value character count should be less than
     *          100 characters
     * @param javaDouble JSON object containing key value pairs of valid floating point numbers.<br />
     * Value should be between range -1.7976931348623157e+308 & 1.7976931348623157e+308
     */
    sendSessionProperties(javaLong?: SessionPropertyMap<number>,
        date?: SessionPropertyMap<Date>,
        shortString?: SessionPropertyMap<string>,
        javaDouble?: SessionPropertyMap<number>): void;

    /**
     * sends a custom error with key and value as metadata
     * @param key - the key of the error, e.g. 'validation error'
     * @param value - the error value, e.g. 'Email validation failed'
     * @param hint - a hint to pinpoint the problem, e.g. content of the input element which triggered the failed validation
     * @param parentingInfo - how the custom error should be attached (default = false),
     *               [case number]: to which open action the custom error event should be attached,
     *              [case boolean]: if true it will get attached to the current active action
     */
    reportCustomError(key: string, value: string, hint?: string, parentingInfo?: number | boolean): void;

    /**
     * Provides all the needed headers for linking a native web request as
     * those are not recognized out of the box by the agent
     * @param actionId id of the XhrAction
     * @returns headers which should be on the native request
     */
    getHeadersForNativeRequest(actionId: number): DynatraceNativeRequestHeaders;

    /**
     * Provides all the needed cookies for linking a native web request as
     * those are not recognized out of the box by the agent
     * @returns cookies which should be on the native request
     */
    getCookieForNativeRequest(): DynatraceNativeRequestCookies;
}

/**
 * All the cookies which are necessary for linking a native web request
 */
interface DynatraceNativeRequestCookies {
    dtAdk: string;
}

/**
 * All the headers which are necessary for linking a native web request
 */
interface DynatraceNativeRequestHeaders {
    "x-dtpc": string;
    "x-dynatrace": string;
    "x-dtreferer": string;
}

interface MobileFirstNetworkInterceptor {
    /**
     * Is the interceptor enabled or not
     */
    isInterceptorEnabled(): boolean;

    /**
     * Enables the interceptor which wraps the WLResourceRequest
     * @param serverUrl ServerURL for the IBM Mobile First server. 
     */
    enableInterceptor(serverUrl: string): void;

    /**
     * Disables the interceptor again
     */
    disableInterceptor();
}

interface NativeNetworkInterceptorUtils {
    /**
     * Returns all the needed headers for identifying the request in the web application part
     * @param actionId ID of the action that this request should be linked with
     */
    getHeadersForNativeRequest(actionId: number): { [key: string]: string; };

    /**
     * This creates an action for the XHR request. The important thing to note here is that the JSAgent will try to 
     * find a user action which happen right before the XHR. This means in the event of a button click the 
     * button click will automatically be detected and be used for the XHR. If there was no user input right 
     * before the action the function will create an action with the "actionNameFallback" name.
     * @param url URL which was called in the XHR
     * @param webRequestFrameworkName e.g. MobileFirst
     * @param actionNameFallback Fallback for an Action name if a user input could not be detected
     */
    enterNativeRequestAction(url: string, webRequestFrameworkName: string, actionNameFallback?: string): number

    /**
     * Leaves the action
     * @param actionId Id of the action
     */
    leaveNativeRequestAction(actionId: number): void
}

/**
 * Enum that represents the different privacy levels.
 */
declare const enum DataCollectionLevel {
    /**
     * @member {DataCollectionLevel} Off  
     * @description Native Agent doesn't capture any monitoring data.
     */
    Off,

    /**
     * @member {DataCollectionLevel} Performance
     * @description Native Agent captures only anonymous performance data.
     */
    Performance,

    /**
     * @member {DataCollectionLevel} UserBehavior
     * @description Native Agent captures both performance and user data.
     */
    UserBehavior,
}

interface DynatraceMobile {
    /**
    * Sends an endSession signal to the server, which will cause the session to end without waiting for a timeout
    * @param success callback used when the endSession is successful 
    * @param error callback used when the endSession is not successful 
    * @returns Status from if the endVisit call was successful or not
    */
    endVisit(success: any, error: any): number;

    /**
     * Returns an interceptor which helps you to monitor requests to the Mobile First environment. They are wrapped
     * around an action or connected to the latest user input that happened. 
     */
    getMobileFirstNetworkInterceptor(): MobileFirstNetworkInterceptor;

    /**
     * Returns a utils which helps you to monitor native requests. With the help of those functions you can
     * mark them as normal web requests and let them be linked with the web application user actions.
     */
    getNativeNetworkInterceptorUtils(): NativeNetworkInterceptorUtils;

    /**
     * Get the current user privacy options including data collection level
     * (Off, Performance, UserBehavior) and if crash reporting is enabled
     * @param success callback used when retrieving UserPrivacyOptions is successful 
     * @param error callback used when retrieving UserPrivacyOptions is not successful 
     * @returns Current user privacy options for the mobile session
     */
    getUserPrivacyOptions(): Promise<UserPrivacyOptions>;

    /**
     * Set the data collection level (Off, Performance, UserBehavior)
     * and turns on or off crash reporting 
     * @param {UserPrivacyOptions} userPrivacyOptions - Object that represents privacy settings
     * @param success callback used when applying UserPrivacyOptions is successful 
     * @param error callback used when applying UserPrivacyOptions is not successful 
     * @returns true is applying the UserPrivacyOptions was successful and false if not
     */
    applyUserPrivacyOptions(userPrivacyOptions: UserPrivacyOptions, success: any, error: any): boolean;
}

declare var dtrum: DtrumApi;
declare var dynatraceMobile: DynatraceMobile;

