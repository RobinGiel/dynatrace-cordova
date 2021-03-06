"use strict";
window.dtrum = window.dtrum || {
    actionName: () => void 0,
    addActionProperties: () => void 0,
    addEnterActionListener: () => void 0,
    addLeaveActionListener: () => void 0,
    addPageLeavingListener: () => void 0,
    addVisitTimeoutListener: () => void 0,
    beginUserInput: () => { },
    disable: () => void 0,
    disablePersistentValues: () => void 0,
    disableSessionReplay: () => void 0,
    enable: () => void 0,
    enablePersistentValues: () => void 0,
    enableSessionReplay: () => void 0,
    endSession: () => void 0,
    endUserInput: () => void 0,
    enterAction: () => -1,
    enterXhrAction: () => -1,
    enterXhrCallback: () => void 0,
    getAndEvaluateMetaData: () => [],
    identifyUser: () => void 0,
    incrementOnLoadEndMarkers: () => void 0,
    leaveAction: () => void 0,
    leaveXhrAction: () => void 0,
    leaveXhrCallback: () => void 0,
    markAsErrorPage: () => false,
    markXHRFailed: () => false,
    now: () => -1,
    registerPreDiffMethod: () => void 0,
    removeEnterActionListener: () => void 0,
    removeLeaveActionListener: () => void 0,
    reportCustomError: () => void 0,
    reportError: () => void 0,
    sendSessionProperties: () => void 0,
    sendSignal: () => void 0,
    setAutomaticActionDetection: () => void 0,
    setLoadEndManually: () => void 0,
    signalLoadEnd: () => void 0,
    signalOnLoadEnd: () => void 0,
    signalOnLoadStart: () => void 0,
    startThirdParty: () => void 0,
    stopThirdParty: () => void 0,
};
window.dtrum.endSession =
    function () {
        return window.dynatraceMobile.endVisit(this.success, this.error);
    };
