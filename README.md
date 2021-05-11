[![N|Solid](https://assets.dynatrace.com/content/dam/dynatrace/misc/dynatrace_web.png)](https://dynatrace.com)

# Dynatrace Cordova Plugin

This plugin gives you the ability to use the Dynatrace instrumentation in your hybrid application (Cordova, Ionic, Capacitor ..). It uses the Mobile Agent and the JavaScript Agent. The Mobile Agent will give you all device specific values containing lifecycle information and the JavaScript Agent will allow you to manually instrument your JavaScript/TypeScript code out of the box (TypeScript definitions included). The JavaScript Agent will cover the network calls (depending on your used libraries) and will automatically detect them.

## Versioning

The `dynatrace-cordova-plugin` is the old version of this plugin. Consider it deprecated. Only use `@dyntrace/cordova-plugin` from now on, if you want to have the newest version. If you are upgrading from the old version have a look at our [migration](#migration-from-old-plugin) guide which is explaining what has changed. The versioning changed as well, the old 7.2.x was based on the versions of the Mobile Agents used. Now the plugin has its own versioning. The version of the used Mobile Agent can be seen [here](#agent-versions).

## Requirements

* For Linux users: Bash (Only a requirement if you are using Linux)
* For Android users: Minimum SDK version 15
* For iOS users: Minimum iOS 8
* For JavaScript Agent: access to API of cluster
* Android: Gradle > 5.0 ([How to update?](#updating-to-gradle-5))
* Node: > 10.x

## Agent Versions

This agent versions are configured in this plugin:

* iOS Agent: 8.215.1.1004
* Android Agent: 8.211.1.1010

## Quick Setup

1. [Installation of the plugin](#1-installation-of-the-plugin)
2. [Configuration with Dynatrace](#2-configuration-with-dynatrace)
3. [Make a build](#3-make-a-build)
4. [Validate instrumentation](#4-validate-instrumentation)

## Advanced Topics 

* [Capacitor instrumentation](#capacitor-instrumentation)
* [Cordova configuration](#cordova-configuration)
    * [Content Security Policy url](#content-security-policy-url)
    * [Debug property](#debug-property)
* [Mobile Agent configuration](#mobile-agent-configuration)
    * [Hybrid related configuration](#hybrid-related-configuration)
* [JavaScript Agent configuration](#javascript-agent-configuration)
    * [JavaScript Agent Snippet Mode](#javascript-agent-snippet-mode)
    * [Allow any certificate](#allow-any-certificate)
* [Manual instrumentation](#manual-instrumentation)
    * [Create manual action](#create-manual-action)
    * [Report error](#report-error)
    * [Identify user](#identify-user)
    * [More examples](#more-examples)
    * [Typings file for JavaScript Agent API](#typings-file-for-javascript-agent-api)
* [Manual instrumentation - Mobile Agent](#manual-instrumentation-mobile-agent)
    * [End session](#end-session)
    * [User Privacy Options](#user-privacy-pptions)
    * [Typings file for Mobile Agent API](#typings-file-for-mobile-agent-api)
* [Native Webrequests](#native-webrequests)
* [IBM Mobile First](#ibm-mobile-first)
* [Ionic WebView for Cordova](#ionic-webview-for-cordova)
* [Download older plugin version](#download-older-plugin-version)
* [Custom arguments for instrumentation script](#custom-arguments-for-instrumentation-script)
* [Migration from old plugin](#migration-from-old-plugin)
* [Updating to Gradle 5](#updating-to-gradle-5)
* [Native OneAgent debug logs](#native-oneagent-debug-logs)
    * [Android](#android)
    * [iOS](#ios)
* [Official documentation](#official-documentation)
* [Troubleshooting and current restrictions](#troubleshooting-and-current-restrictions)
* [Changelog](#changelog)

# Quick Setup

## 1. Installation of the plugin

To install the plugin in your Cordova based project you must enter the following command in the root directory of your cordova based project. E.g. :

```
cordova plugin add @dynatrace/cordova-plugin --save
```

## 2. Configuration with Dynatrace

If you want to instrument your Cordova application just go to your Dynatrace WebUI and select the menu point "Deploy Dynatrace". Choose to setup mobile monitoring and select Cordova. Afterwards it is possible for you to add the Web part (JavaScript Agent) automatically and download the `dynatrace.config.js` file.
 
This file should be placed in the `root of your project` (same place where the *package.json* is stored). If the file is not available the instrumentation will not work.

> Ionic Webview for Cordova: If you are using the Ionic WebView for Cordova (cordova-plugin-ionic-webview) you need to make sure you [set correct cookie domain](#ionic-webview-for-cordova).

## 3. Make a build

After starting the Cordova or Ionic build, with `ionic cordova build android` or `cordova build android` the instrumentation will be handled by the plugin. Of course `android` can be substituted with `ios` platform. If you have trouble with not finding the .gradle, .plist or dynatrace.config.js file you can specify those via [custom arguments](#custom-arguments-for-instrumentation-script). E.g. `cordova build android --config=C:\config\dynatrace.config.js` is a valid command and will try to use the configuration stored in the `\config` folder.

## 4. Validate instrumentation

This section should explain what data should be visible after applying the plugin. The most important aspect is that there should be a `combined` session. We talk about a `combined` session when there are `Mobile` and `Web` actions within one session. 

[![N|Solid](https://dt-cdn.net/images/sessiondetail-975-bd15de64c8.png)]()

This screen shows what a `combined` sample user session should roughly look like. The session contains a `Mobile` action and some `Web(Load, XHR)` actions. Those first two actions should always be visible in your application session. The first one defines the native application startup ("Loading EasyTravel"). The second one defines the first load of the index.html of your hybrid application ("Loading of page ..").

# Advanced Topics

## Capacitor Instrumentation

To instrument your Ionic Capacitor app, you will need to follow the steps below:

1. Install the Dynatrace Cordova Plugin via the following command:
* `npm install @dynatrace/cordova-plugin`
2. Go to your Dynatrace WebUI and select the menu point "Deploy Dynatrace". Choose to setup mobile monitoring and select Cordova. Click the *Monitor the web view* button if you have not already.
3. Click the *Download dynatrace.config.js* button and move the downloaded file to the root of your capacitor project.
4. Run the following commands (replace `<platform>` with `ios` or `android`):
  * `ionic capacitor sync <platform>` 
  * `ionic capacitor build <platform>`
5. Run your application


## Cordova configuration

```js
module.exports = {
    cordova : {
        debug : false,
		    cspURL: "http://..."
	},
	...
}
```

### Content Security Policy url

There is flag for updating the CSP (Content Security Policy). By default this value is `set` and the plugin will modify the CSP. The URL in the `cspURL` property will be placed into a CSP configuration (if available) in your index.html. This will allow/unblock connections to the Dynatrace server. If you don't want to use this feature, remove the cspURL property and the plugin will not modify the CSP configuration.

### Debug property

The default value is `false`. This property generates more log output and is sometimes necessary if you need to find the cause for a non-working plugin.

## Mobile Agent configuration

```js
module.exports = {
    android : {
		config : `...`
    },

    ios : {
        config : `...`
    }  
}
```

The native configuration contain all the settings which are necessary for the Mobile Agent(s). You can find all the available properties in the [documentation](#official-documentation) of the mobile agent.

The content of the `ios.config` property will be directly copied to the plist file. The content of the `android.config` property will be directly copied to the gradle file.

### Hybrid related configuration

Here we list the configuration which is especially important if you are instrumenting a Hybrid application.

```js
module.exports = {
    android : {
		config : `
		dynatrace{
			configurations {
				defaultConfig{
					autoStart{
						...
					}
					hybridWebView{
						enabled true
						domains '.example.com', '.dynatrace.com'
					}
				}
			}
		}
		`
    },

    ios : {
		config : `
    <key>DTXHybridApplication</key>
    <true/>
    <key>DTXSetCookiesForDomain</key>
    <array>
      <string>.example.com</string>
      <string>.dynatrace.com</string>
    </array>
		`
    }  
}
```

* `DTXHybridApplication` or `hybridWebView.enabled` : Set to `true` if you have a Hybrid application. The default value is `false`.

* `DTXSetCookiesForDomain` or `hybridWebView.domains` : For hybrid applications using the JavaScript agent, cookies need to be set for each instrumented domain or server the application communicates with. You can specify domains, host or IP addresses. Domains or sub-domains must start with a dot. Separate the list elements with a comma.

## JavaScript Agent configuration

Basically all needed properties for the JavaScript Agent are predefined by the downloadable `dynatrace.config.js`. There are three available properties: 
* `url` - Dynatrace API url to retrieve the JS agent script tag.
* `mode` - Values can be numbers 0-4 depending on what JavaScript Agent code snippet you want to use.
* `allowanycert` - Allows the plugin to ignore certificate issues when retrieving the JavaScript Agent.


### JavaScript Agent Snippet Mode

Using a specific mode can allow you during build to insert any of the available JavaScript agent code snippet options that are offered. 
[Click here](https://www.dynatrace.com/support/help/shortlink/rum-injection#manual-insertion) for more details on the options listed below:
* 0 - `jsInlineScript`
* 1 - `jsTagComplete`
* 2 - `syncCS` (Default)
* 3 - `asyncCS`
* 4 - `jsTag`

```js
module.exports = {
    js : {
        url : `https://.../jsInlineScript/...`,
        mode: 2
    },
}
```


The above example will use mode option 2 and retrieve the synchronous code snippet of the JavaScript agent. 

**Note:**
The default url value will be used if mode is not included in the `dynatrace.config.js` file or if mode exists and the value is not valid (i.e. not a number 0 through 4).

### Allow any certificate

If you are having an issue retrieving the JavaScript Agent and see an error message relating to a certificate:

```
Could not retrieve the JavaScript Agent! - Could not retrieve agent optionsError: unable to verify the first certificate
```

You are able to bypass those errors at your **OWN RISK** by using `allowanycert: true` within the `js` property. This will ignore the fact that the SSL connection is not secure (e.g. because of invalid certificate) and will retrieve the JavaScript Agent snippet anyways. An example would look like this:

```js
module.exports = {
    js : {
        url : `...`,
        allowanycert: true
    },
}
```

## Manual instrumentation

The JavaScript Agent interface will be provided by the JavaScript Agent, it can be used everywhere in your application by simply calling `dtrum`.

This gives you the possibility to instrument your code even further by additional manual instrumentation. If you like to know more about the manual instrumentation have a look into the Dynatrace [documentation](#official-documentation). It is also possible to look into the definition file (`plugins/dynatrace-cordova-plugin/typings/main.d.ts`) to see the API documentation.

### Create manual action

To create a manual action that is called `"MyButton tapped"` you just need to use the following code below. The *leaveAction* will close the action again. It is possible to report errors for this action before closing, see next section [Report Error](#report-error).

```ts
"enterAction"(actionName: string, actionType: string, startTime?: number, sourceUrl?: string, sourceTitle?: string): number;

"leaveAction"(actionId: number, stopTime?: number, startTime?: number): void;
```

```js
var action = dtrum.enterAction('simple action', 'click', null, 'http://whatever.com');
//do something here
dtrum.leaveAction(action);
```

### Report error

For any open action you can report certain values. The following APIs are available on the Action:

```js
reportError(error: Error | string, parentActionId?: number): void;

dtrum.reportError('Error: Hello World with AJAX!');
```

### Identify user

It is possible to identify a user and tag the current session with a name. You need to do the following call:

```js
dtrum.identifyUser("User XY");
```

### More examples 

The above functionalities are only a small part of how you can use the API. If you want to know more you can visit the Settings in the WebUI. 

[![N|Solid](https://dt-cdn.net/images/settings-1103-17bfa1ae2f.png)]()

### Typings file for JavaScript Agent API

To use the interface of the JavaScript Agent directly you must specify the typing definition file in the *tsconfig.json*. Add the following block to the *tsconfig.json*: 

```
"files": ["plugins/dynatrace-cordova-plugin/typings/main.d.ts"] 
```

If "files" is already defined, just add the path to the already defined ones.

## Manual instrumentation - Mobile Agent

The Mobile Agent interface will be provided by the Mobile Agent, so it can be used everywhere in your application by simply calling `dynatraceMobile`.

### End session

In a hybrid scenario it is only possible for the mobile agent to end a session/visit. That's why we expose the endVisit function of the Mobile Agent. 

The interface is available with the name `dynatraceMobile` (TypeScript definitions included). Calling `dynatraceMobile.endVisit(successCallback, errorCallback)` will end the session/visit. Example how this call looks like:

```js
dynatraceMobile.endVisit(() => {
	// Success
	console.log("Visit was ended!");
}, () => {
	// Error
	console.log("Visit wasn't ended!");
});
```

You can also use the dtrum API directly to end the session:

```js
dtrum.endSession();
```


### User Privacy Options

The privacy API methods allow you to dynamically change the data-collection level based on the individual preferences of your end users. Each end user can select from three data-privacy levels:

```js
const enum DataCollectionLevel {
	Off, Performance, UserBehavior
}
```

1. Off: Native Agent doesn't capture any monitoring data.
2. Performance: Native Agent captures only anonymous performance data. Monitoring data that can be used to identify individual users, such as user tags and custom values, aren't captured.
3. UserBehavior: Native Agent captures both performance and user data. In this mode, Native Agent recognizes and reports users who re-visit in future sessions.

Here are some examples of how to use the API:

To check the current privacy options that are set:

```js
dynatraceMobile.getUserPrivacyOptions((result) => {
	// Successfully retrieve UserPrivacyOptions Object (i.e. result):
  if(result) { 
    console.log(`Current Privacy config: ${Object.keys(result).map(function(key) {return result[key]})}`); 
  }
}, (error) => { 
  // Error
  console.log(`Error: ${error}`); 
  });
```

If you want to create a new `UserPrivacyOptions` object:

```js
let userPrivacy = new UserPrivacyOptions(DataCollectionLevel.UserBehavior, true);
```

To apply the values that were set on the object:

```js
dynatraceMobile.applyUserPrivacyOptions(userPrivacy);
```

### Typings file for Mobile Agent API

To use the interface of the Mobile Agent directly you must specify the typing definition file in the *tsconfig.json*. Add the following block to the *tsconfig.json*: 

```
"files": ["plugins/dynatrace-cordova-plugin/typings/main.d.ts"] 
```

If "files" is already defined, just add the path to the already defined ones.

## Native Webrequests

**Attention:** This feature requires a instrumented webserver with version 1.211.x

Within Cordova it is also possible to use libraries that are executing native web requests. Some examples are: cordova-plugin-advanced-http, @ionic-native/http, cordova-plugin-okhttp or Mobile First by IBM.

Those libraries are not executing the request within the JS scope but will rather call a JavaScript<->Native interface and will trigger the request natively. This means that our JavaScript OneAgent will not be able to detect the request. Additionally a resulting user action can be dropped as well. To prevent this behaviour you need to manually apply headers to your request. 

Before using this feature you need to turn of web request instrumentation on iOS. You can do this by adding the following configuration to the dynatrace.config.js:

```js
ios: {
  config: `
  <key>DTXInstrumentWebRequestTiming</key>
  <false/>
  `
}
```

The following code will create a user action and a linked web request for you: 

```js
// Creation of your request. This might depend on the library you are using
MyTestRequest request = new MyTestRequest("MY_URL");

let interceptorUtils = dynatraceMobile.getNativeNetworkInterceptorUtils();

// Creation of a user action with automated dection of the user action - e.g. click on
let actionId = interceptorUtils.enterNativeRequestAction("MY_URL", "Name of HTTP Framework", "Optional Action Fallbackname");

// Adding headers to your request - Take a look into typings.d.ts for the format of DynatraceNativeRequestHeaders
request.addHeaders(interceptorUtils.getHeadersForNativeRequest(actionId));

// Sending the request and afterwards close the XhrAction
request.send();

interceptorUtils.leaveNativeRequestAction(actionId);
```

## IBM Mobile First

**Attention:** This feature requires a instrumented webserver with version 1.211.x running at your Mobile First server.

If you are using IBM Mobile First you might take a look at our `dynatraceMobile.getMobileFirstNetworkInterceptor()`. This interceptor gives you the option to make the request going to Mobile First more visible. The Mobile First library is doing native mobile web requests, that's why those request can't be linked with user actions happening in the web part. 

This interceptor is creating wrapping actions according to the user input that happened right before the request. By this modification you will be able to see the request in the user session linked with user actions.

Before using this feature you need to turn of web request instrumentation on iOS. You can do this by adding the following configuration to the dynatrace.config.js:

After Mobile First has been initialized make the following call:

```js
dynatraceMobile.getMobileFirstNetworkInterceptor().enableInterceptor();

if(dynatraceMobile.getMobileFirstNetworkInterceptor().isInterceptorEnabled()){
	// Everything is setup correctly
}
```

It is also possible to deactivate the interceptor again. This will reset the modifications to the WLResourceRequest:

```js
dynatraceMobile.getMobileFirstNetworkInterceptor().disableInterceptor();

if(!dynatraceMobile.getMobileFirstNetworkInterceptor().isInterceptorEnabled()){
	// Interceptor was disabled
}
```

## Ionic WebView for Cordova

The Mobile agent usually sets cookies on the correct domain but the [cordova-plugin-ionic-webview](https://github.com/ionic-team/cordova-plugin-ionic-webview) uses different domains. Those domains need to be added in the configuration. If you defined a custom [hostname](https://github.com/ionic-team/cordova-plugin-ionic-webview#hostname) you need to take this into account as well for choosing the correct domain. A sample configuration which takes care about the default domain for cordova-plugin-ionic-webview looks like the following:

```js
module.exports = {
    android : {
		config : `
		dynatrace{
			configurations {
				defaultConfig{
					autoStart{
						...
					}
					hybridWebView{
						enabled true
						domains 'http://localhost', '.other-domain-you-want-to-specify.com'
					}
				}
			}
		}
		`
    },

    ios : {
		config : `
		<DTXHybridApplication>true</DTXHybridApplication>
		<DTXSetCookiesForDomain>ionic://localhost,.other-domain-you-want-to-specify.com</DTXSetCookiesForDomain>
		`
    }  
}
```

## Download older plugin version

The version can be used like in any other npm package. You just have to use the @ sign if you want to specify a certain version:

```
cordova plugin add @dynatrace/cordova-plugin@1.191.1 --save
```

This will download the version `1.191.1` of our plugin. In general we recommend you to always use the latest version.

## Custom arguments for instrumentation script

**Note:**
Custom arguments will not work with Capacitor based projects.

Our scripts assumes that the usual cordova project structure is given. The following arguments can be specified for our instrumentation script if the project structure is different.

* `--gradle=C:\MyCordovaAndroidProject\platforms\android\build.gradle` - the location of the root build.gradle file. We will assume that the other gradle file resides in `/app/build.gradle`. This will add all agent dependencies automatically for you and will update the configuration.
* `--plist=C:\MyCordovaIOSProject\platforms\ios\projectName\projectName-Info.plist` - Tell the script where your info.plist file is. The plist file is used for updating the configuration for the agent. 
* `--config=C:\SpecialFolderForDynatrace\dynatrace.config.js` - Used for if you have not added your config file in the root folder of the Cordova project but somewhere else.
* `--jsagent=C:\MyCordovaProject\scripts\jsSnippet.txt` - If you want to use a local script/text file that includes the JS Agent snippet downloaded from the WebUI or retrieved from using the Dynatrace API. Note that you can name the file whatever you want but the file and directory that you use needs to exist. The file downloaded from the WebUI will be named `jsSnippet.txt` by default.

Example:

```
cordova build android --config=C:\SpecialFolderForDynatrace\dynatrace.config.js
```

If you use Ionic make sure to use -- :

```
ionic cordova build android -- --config=C:\SpecialFolderForDynatrace\dynatrace.config.js
```

**Additional Note:**
For the local script file, we copy the specified file 1:1. It is best to download the JS agent snippet from the WebUI after selecting the desired JS agent format and clicking the **Download** link below the shown code snippet. To get to this page, go to your **Web Application** settings and then select **Setup**. The contents of the file will be copied 1:1 inside of the `<head>` tag of your Cordova applications platform based html files. 

[![N|Solid](https://dt-cdn.net/images/downloadjsagent-931-db2b060f72.png)]()


## Migration from old plugin

The differences to the old `dynatrace-cordova-plugin` are very small. There are three differences:

* The Android instrumentation is now executed via gradle. This makes the build way faster and more stable. The new plugin is now automatically modifying your gradle files.
* The plugin raised the requirements for Gradle to version 5. This can easily be [upgraded](#updating-to-gradle-5) in your project by changing one line.
* The format of the configuration changed from `dynatrace.config` to `dynatrace.config.js`. The new format can be downloaded via WebUI. If you had some custom settings in Android take a look in the detailed [documentation](#official-documentation). The format of iOS basically stayed the same.

## Updating to Gradle 5

Updating Gradle only affects your Android build. To Update your project to Gradle 5 you have to modify one file in your Android folder. 

- `ProjectFolder\android\cordova\lib\builders\ProjectBuilder.js` Contains the following line:

```
var distributionUrl = process.env['CORDOVA_ANDROID_GRADLE_DISTRIBUTION_URL'] || 'https\\://services.gradle.org/distributions/gradle-4.3.10-all.zip';
```

make sure you insert some other version like `5.4.1` here:

```
var distributionUrl = process.env['CORDOVA_ANDROID_GRADLE_DISTRIBUTION_URL'] || 'https\\://services.gradle.org/distributions/gradle-5.4.1-all.zip';
```

If you having trouble with this option you can always set the global process property `CORDOVA_ANDROID_GRADLE_DISTRIBUTION_URL` :

```
process.env['CORDOVA_ANDROID_GRADLE_DISTRIBUTION_URL'] = 'https\\://services.gradle.org/distributions/gradle-5.4.1-all.zip';
```

## Native OneAgent debug logs

If your application starts but you see no data (or the session is not merged), you probably need to dig deeper to find out why the OneAgents aren't sending any data. Opening up a support ticket is a great idea, but gathering logs first is even better. 

### Android

Add the following configuration snippet to your other configuration in dynatrace.config.js right under the autoStart block (the whole structure is visible, so you know where the config belongs):

```js
android: {
  config: `
    dynatrace {
      configurations {
        defaultConfig {
          autoStart{
            ...
          }
          debug.agentLogging true
        }
      }
    }
  `
}
```

### iOS

Add the following configuration snippet to your other configuration in dynatrace.config.js (the whole structure is visible, so you know where the config belongs):

```js
ios: {
  config: `
  <key>DTXLogLevel</key>
  <string>ALL</string>
  `
}
```

## Official documentation

  * Android Agent: https://www.dynatrace.com/support/help/technology-support/operating-systems/android/
  * iOS Agent: https://www.dynatrace.com/support/help/technology-support/operating-systems/ios/

## Troubleshooting and current restrictions:

Basically if you have problems with the plugin please have a look into the logs. They will tell you what went wrong. The logs can be found in the plugins folder of your Cordova project. There is a directory called "Logs". 

* If you see a message like "Error: Could not retrieve the JSAgent! Error: self signed certificate in certificate chain" try to switch the JavaScript Agent configuration from HTTPS to HTTP.
* If you use live reload (e.g. ionic cordova run android -l) be aware that Ionic/Cordova doesn't use files from the platform folder, so the JavaScript Agent injection will not take place, as we only instrument the temporary platform folder. You are still able to add the copied JS Agent code snippet from the WebUI manually to your index.html (in the source directory). To get to this page, go to your **Web Application** settings and then select **Setup**. Auto-Instrumentation with the Mobile Agent still takes place.
* If you have problems retrieving the JavaScript Agent and you get error messages that the JavaScript Agent can not be retrieved, you probably don't have access to the API or there is a certificate issue. If this is the certificate use the [allowanycert feature](#allow-any-certification). In any other case a workaround is possible to use the cli and add the `--jsagent=` custom parameter and download the full Javascript Agent and add the path to the downloaded JS Agent file to the custom parameter value - With this the plugin will not retrieve the JS agent and will use the one that is specified.

## Changelog

1.217.0
* Added support for [native web requests](#native-webrequests)
* Added support for [IBM Mobile First](#ibm-mobile-first)
* Added [UserPrivacyOptions API](#user-privacy-options)
* End session available via dtrum API
* Added support for [ionic capacitor](#capacitor-instrumentation)
* Updated iOS (8.215.1.1004) and Android Agent (8.211.1.1010)

1.213.0
* Added new [custom parameter for cli](#custom-arguments-for-instrumentation-script) to allow use of local js agent script file
* Added [mode option](#javascript-agent-snippet-mode) in the config file for using specific JSAgent code snippet
* No longer store JS Agent file and only inject platform html
* Added dtrum API that will prevent errors if JS agent is not loaded
* Updated iOS (8.209.1.1003) and Android Agent (8.211.1.1010)
* Skipping not readable files instead of throwing an exception

1.205.0
* Updated iOS and Android agent

1.201.0
* Updated iOS and Android agent

1.192.0
* Fix for Installation/Removing issues

1.191.2
* Android Instrumentation changed to Gradle
* New Mobile Agents (> 8.x)
