angular.module('app').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('directives/account-menu.html',
    "<div class='sn-component'>\n" +
    "<div class='sk-panel' id='account-panel'>\n" +
    "<div class='sk-panel-header'>\n" +
    "<div class='sk-panel-header-title'>Account</div>\n" +
    "<a class='sk-a info close-button' ng-click='close()'>Close</a>\n" +
    "</div>\n" +
    "<div class='sk-panel-content'>\n" +
    "<div class='sk-panel-section sk-panel-hero' ng-if='!user &amp;&amp; !formData.showLogin &amp;&amp; !formData.showRegister &amp;&amp; !formData.mfa'>\n" +
    "<div class='sk-panel-row'>\n" +
    "<div class='sk-h1'>Sign in or register to enable sync and end-to-end encryption.</div>\n" +
    "</div>\n" +
    "<div class='sk-panel-row'>\n" +
    "<div class='sk-button-group stretch'>\n" +
    "<div class='sk-button info featured' ng-click='formData.showLogin = true'>\n" +
    "<div class='sk-label'>Sign In</div>\n" +
    "</div>\n" +
    "<div class='sk-button info featured' ng-click='formData.showRegister = true'>\n" +
    "<div class='sk-label'>Register</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-panel-row sk-p'>\n" +
    "Standard Notes is free on every platform, and comes standard with sync and encryption.\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-panel-section' ng-if='formData.showLogin || formData.showRegister'>\n" +
    "<div class='sk-panel-section-title'>\n" +
    "{{formData.showLogin ? \"Sign In\" : \"Register\"}}\n" +
    "</div>\n" +
    "<form class='sk-panel-form' ng-submit='submitAuthForm()'>\n" +
    "<div class='sk-panel-section'>\n" +
    "<input class='sk-input contrast' name='email' ng-model-options='{allowInvalid: true}' ng-model='formData.email' placeholder='Email' required should-focus='true' sn-autofocus='true' spellcheck='false' type='email'>\n" +
    "<input class='sk-input contrast' name='password' ng-model='formData.user_password' placeholder='Password' required sn-enter='submitAuthForm()' type='password'>\n" +
    "<input class='sk-input contrast' name='password' ng-if='formData.showRegister' ng-model='formData.password_conf' placeholder='Confirm Password' required sn-enter='submitAuthForm()' type='password'>\n" +
    "<div class='sk-panel-row'></div>\n" +
    "<a class='sk-panel-row sk-bold' ng-click='formData.showAdvanced = !formData.showAdvanced'>\n" +
    "Advanced Options\n" +
    "</a>\n" +
    "</div>\n" +
    "<div class='sk-notification unpadded contrast advanced-options sk-panel-row' ng-if='formData.showAdvanced'>\n" +
    "<div class='sk-panel-column stretch'>\n" +
    "<div class='sk-notification-title sk-panel-row padded-row'>Advanced Options</div>\n" +
    "<div class='bordered-row padded-row'>\n" +
    "<label class='sk-label'>Sync Server Domain</label>\n" +
    "<input class='sk-input mt-5 sk-base' name='server' ng-model='formData.url' placeholder='Server URL' required type='text'>\n" +
    "</div>\n" +
    "<label class='sk-label padded-row' ng-if='formData.showLogin'>\n" +
    "<input class='sk-input' ng-model='formData.strictSignin' type='checkbox'>\n" +
    "Use strict sign in\n" +
    "<span>\n" +
    "<a class='info' href='https://standardnotes.org/help/security' rel='noopener' target='_blank'>(Learn more)</a>\n" +
    "</span>\n" +
    "</input>\n" +
    "</label>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-panel-section form-submit' ng-if='!formData.authenticating'>\n" +
    "<div class='sk-button-group stretch'>\n" +
    "<div class='sk-button info featured' ng-click='submitAuthForm()' ng-disabled='formData.authenticating'>\n" +
    "<div class='sk-label'>{{formData.showLogin ? \"Sign In\" : \"Register\"}}</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-notification neutral' ng-if='formData.showRegister'>\n" +
    "<div class='sk-notification-title'>No Password Reset.</div>\n" +
    "<div class='sk-notification-text'>Because your notes are encrypted using your password, Standard Notes does not have a password reset option. You cannot forget your password.</div>\n" +
    "</div>\n" +
    "<div class='sk-panel-section no-bottom-pad' ng-if='formData.status'>\n" +
    "<div class='sk-horizontal-group'>\n" +
    "<div class='sk-spinner small neutral'></div>\n" +
    "<div class='sk-label'>{{formData.status}}</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-panel-section no-bottom-pad' ng-if='!formData.authenticating'>\n" +
    "<label class='sk-panel-row justify-left'>\n" +
    "<div class='sk-horizontal-group'>\n" +
    "<input ng-false-value='true' ng-model='formData.ephemeral' ng-true-value='false' type='checkbox'>\n" +
    "Stay signed in\n" +
    "</div>\n" +
    "</label>\n" +
    "<label class='sk-panel-row justify-left' ng-if='notesAndTagsCount() &gt; 0'>\n" +
    "<div class='sk-panel-row'></div>\n" +
    "<input ng-bind='true' ng-change='mergeLocalChanged()' ng-model='formData.mergeLocal' type='checkbox'>\n" +
    "Merge local data ({{notesAndTagsCount()}} notes and tags)\n" +
    "</label>\n" +
    "</div>\n" +
    "</form>\n" +
    "</div>\n" +
    "<div class='sk-panel-section' ng-if='formData.mfa'>\n" +
    "<form class='sk-panel-form' ng-submit='submitMfaForm()'>\n" +
    "<div class='sk-p sk-panel-row'>{{formData.mfa.message}}</div>\n" +
    "<div class='sk-panel-row'>\n" +
    "<input autofocus='true' class='sk-input contrast' name='mfa' ng-model='formData.userMfaCode' placeholder='Enter Code' required should-focus='true' sn-autofocus='true'>\n" +
    "</div>\n" +
    "<div class='sk-button-group stretch sk-panel-row form-submit' ng-if='!formData.status'>\n" +
    "<button class='sk-button info featured' type='submit'>\n" +
    "<div class='sk-label'>Sign In</div>\n" +
    "</button>\n" +
    "</div>\n" +
    "</form>\n" +
    "<div class='sk-panel-section no-bottom-pad' ng-if='formData.status'>\n" +
    "<div class='sk-panel-row'></div>\n" +
    "<div class='sk-panel-row'></div>\n" +
    "<div class='sk-horizontal-group'>\n" +
    "<div class='sk-spinner small neutral'></div>\n" +
    "<div class='sk-label'>{{formData.status}}</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div ng-if='!formData.showLogin &amp;&amp; !formData.showRegister &amp;&amp; !formData.mfa'>\n" +
    "<div class='sk-panel-section' ng-if='user'>\n" +
    "<div class='sk-notification danger' ng-if='syncStatus.error'>\n" +
    "<div class='sk-notification-title'>Sync Unreachable</div>\n" +
    "<div class='sk-notification-text'>Hmm...we can't seem to sync your account. The reason: {{syncStatus.error.message}}</div>\n" +
    "<a class='sk-a info-contrast sk-bold sk-panel-row' href='https://standardnotes.org/help' rel='noopener' target='_blank'>Need help?</a>\n" +
    "</div>\n" +
    "<div class='sk-panel-row'>\n" +
    "<div class='sk-panel-column'>\n" +
    "<div class='sk-h1 sk-bold wrap'>{{user.email}}</div>\n" +
    "<div class='sk-subtitle subtle normal'>{{server}}</div>\n" +
    "</div>\n" +
    "<div class='sk-horizontal-group' delay-hide='true' delay='1000' show='syncStatus.syncOpInProgress || syncStatus.needsMoreSync'>\n" +
    "<div class='sk-spinner small info'></div>\n" +
    "<div class='sk-sublabel'>\n" +
    "{{\"Syncing\" + (syncStatus.total > 0 ? \":\" : \"\")}}\n" +
    "<span ng-if='syncStatus.total &gt; 0'>{{syncStatus.current}}/{{syncStatus.total}}</span>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-panel-row'></div>\n" +
    "<a class='sk-a info sk-panel-row condensed' ng-click='openPasswordWizard(&#39;change-pw&#39;)'>\n" +
    "Change Password\n" +
    "</a>\n" +
    "<a class='sk-a info sk-panel-row condensed' ng-click='openPrivilegesModal(&#39;&#39;)' ng-show='user'>\n" +
    "Manage Privileges\n" +
    "</a>\n" +
    "<a class='sk-panel-row justify-left condensed success' ng-click='openPasswordWizard(&#39;upgrade-security&#39;)' ng-if='securityUpdateAvailable'>\n" +
    "<div class='inline sk-circle small success mr-8'></div>\n" +
    "<div class='inline'>Security Update Available</div>\n" +
    "</a>\n" +
    "</div>\n" +
    "<div class='sk-panel-section'>\n" +
    "<div class='sk-panel-section-title'>Encryption</div>\n" +
    "<div class='sk-panel-section-subtitle info' ng-if='encryptionEnabled()'>\n" +
    "{{encryptionStatusForNotes()}}\n" +
    "</div>\n" +
    "<p class='sk-p'>\n" +
    "{{encryptionStatusString()}}\n" +
    "</p>\n" +
    "</div>\n" +
    "<div class='sk-panel-section'>\n" +
    "<div class='sk-panel-section-title'>Passcode Lock</div>\n" +
    "<div ng-if='!hasPasscode()'>\n" +
    "<div ng-if='canAddPasscode'>\n" +
    "<div class='sk-panel-row' ng-if='!formData.showPasscodeForm'>\n" +
    "<div class='sk-button info' ng-click='addPasscodeClicked(); $event.stopPropagation();'>\n" +
    "<div class='sk-label'>Add Passcode</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<p class='sk-p'>Add an app passcode to lock the app and encrypt on-device key storage.</p>\n" +
    "</div>\n" +
    "<div ng-if='!canAddPasscode'>\n" +
    "<p class='sk-p'>Adding a passcode is not supported in temporary sessions. Please sign out, then sign back in with the \"Stay signed in\" option checked.</p>\n" +
    "</div>\n" +
    "</div>\n" +
    "<form class='sk-panel-form' ng-if='formData.showPasscodeForm' ng-submit='submitPasscodeForm()'>\n" +
    "<div class='sk-panel-row'></div>\n" +
    "<input class='sk-input contrast' ng-model='formData.passcode' placeholder='Passcode' should-focus='true' sn-autofocus='true' type='password'>\n" +
    "<input class='sk-input contrast' ng-model='formData.confirmPasscode' placeholder='Confirm Passcode' type='password'>\n" +
    "<div class='sk-button-group stretch sk-panel-row form-submit'>\n" +
    "<button class='sk-button info' type='submit'>\n" +
    "<div class='sk-label'>Set Passcode</div>\n" +
    "</button>\n" +
    "</div>\n" +
    "<a class='neutral sk-a sk-panel-row' ng-click='formData.showPasscodeForm = false'>Cancel</a>\n" +
    "</form>\n" +
    "<div ng-if='hasPasscode() &amp;&amp; !formData.showPasscodeForm'>\n" +
    "<div class='sk-p'>\n" +
    "Passcode lock is enabled.\n" +
    "</div>\n" +
    "<div class='sk-notification contrast'>\n" +
    "<div class='sk-notification-title'>Options</div>\n" +
    "<div class='sk-notification-text'>\n" +
    "<div class='sk-panel-row'>\n" +
    "<div class='sk-horizontal-group'>\n" +
    "<div class='sk-h4 sk-bold'>Autolock</div>\n" +
    "<a class='sk-a info' ng-class='{&#39;boxed&#39; : option.value == selectedAutoLockInterval}' ng-click='selectAutoLockInterval(option.value)' ng-repeat='option in passcodeAutoLockOptions'>\n" +
    "{{option.label}}\n" +
    "</a>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-p'>The autolock timer begins when the window or tab loses focus.</div>\n" +
    "<div class='sk-panel-row'></div>\n" +
    "<a class='sk-a info sk-panel-row condensed' ng-click='openPrivilegesModal(&#39;&#39;)' ng-show='!user'>Manage Privileges</a>\n" +
    "<a class='sk-a info sk-panel-row condensed' ng-click='changePasscodePressed()'>Change Passcode</a>\n" +
    "<a class='sk-a danger sk-panel-row condensed' ng-click='removePasscodePressed()'>Remove Passcode</a>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-panel-section' ng-if='!importData.loading'>\n" +
    "<div class='sk-panel-section-title'>Data Backups</div>\n" +
    "<div class='sk-p'>\n" +
    "Download a backup of all your data.\n" +
    "</div>\n" +
    "<div class='sk-panel-row'></div>\n" +
    "<form class='sk-panel-form sk-panel-row' ng-if='encryptedBackupsAvailable()'>\n" +
    "<div class='sk-input-group'>\n" +
    "<label>\n" +
    "<input ng-change='archiveFormData.encrypted = true' ng-model='archiveFormData.encrypted' ng-value='true' type='radio'>\n" +
    "Encrypted\n" +
    "</label>\n" +
    "<label>\n" +
    "<input ng-change='archiveFormData.encrypted = false' ng-model='archiveFormData.encrypted' ng-value='false' type='radio'>\n" +
    "Decrypted\n" +
    "</label>\n" +
    "</div>\n" +
    "</form>\n" +
    "<div class='sk-button-group sk-panel-row justify-left'>\n" +
    "<div class='sk-button info' ng-click='downloadDataArchive()'>\n" +
    "<div class='sk-label'>Download Backup</div>\n" +
    "</div>\n" +
    "<label class='sk-button info'>\n" +
    "<input file-change='-&gt;' handler='importFileSelected(files)' style='display: none;' type='file'>\n" +
    "<div class='sk-label'>Import Backup</div>\n" +
    "</label>\n" +
    "</div>\n" +
    "<span ng-if='isDesktopApplication()'>Backups are automatically created on desktop and can be managed via the \"Backups\" top-level menu.</span>\n" +
    "<div id='import-password-request' ng-if='importData.requestPassword'>\n" +
    "<form class='sk-panel-form stretch' ng-submit='submitImportPassword()'>\n" +
    "<p>Enter the account password associated with the import file.</p>\n" +
    "<input autofocus='true' class='sk-input contrast mt-5' ng-model='importData.password' placeholder='Enter File Account Password' type='password'>\n" +
    "<div class='sk-button-group stretch sk-panel-row form-submit'>\n" +
    "<button class='sk-button info' type='submit'>\n" +
    "<div class='sk-label'>Decrypt & Import</div>\n" +
    "</button>\n" +
    "</div>\n" +
    "<p>\n" +
    "Importing from backup will not overwrite existing data, but instead create a duplicate of any differing data.\n" +
    "</p>\n" +
    "<p>If you'd like to import only a selection of items instead of the whole file, please use the Batch Manager extension.</p>\n" +
    "</form>\n" +
    "</div>\n" +
    "<div class='sk-panel-row'>\n" +
    "<div class='sk-spinner small info' ng-if='importData.loading'></div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-panel-footer'>\n" +
    "<div class='sk-panel-row'>\n" +
    "<div class='sk-p left neutral faded'>{{appVersion}}</div>\n" +
    "<a class='sk-a right' ng-click='formData.showLogin = false; formData.showRegister = false;' ng-if='formData.showLogin || formData.showRegister'>\n" +
    "Cancel\n" +
    "</a>\n" +
    "<a class='sk-a right danger' ng-click='destroyLocalData()' ng-if='!formData.showLogin &amp;&amp; !formData.showRegister'>\n" +
    "{{ user ? \"Sign out and clear local data\" : \"Clear all local data\" }}\n" +
    "</a>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n"
  );


  $templateCache.put('directives/actions-menu.html',
    "<div class='sn-component'>\n" +
    "<div class='sk-menu-panel dropdown-menu'>\n" +
    "<a class='no-decoration' href='https://standardnotes.org/extensions' ng-if='extensions.length == 0' rel='noopener' target='blank'>\n" +
    "<menu-row label='&#39;Download Actions&#39;'></menu-row>\n" +
    "</a>\n" +
    "<div ng-repeat='extension in extensions'>\n" +
    "<div class='sk-menu-panel-header' ng-click='extension.hide = !extension.hide; $event.stopPropagation();'>\n" +
    "<div class='sk-menu-panel-column'>\n" +
    "<div class='sk-menu-panel-header-title'>{{extension.name}}</div>\n" +
    "<div class='sk-spinner small loading' ng-if='extension.loading'></div>\n" +
    "<div ng-if='extension.hide'>…</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<menu-row action='executeAction(action, extension);' label='action.label' ng-if='!extension.hide' ng-repeat='action in extension.actionsWithContextForItem(item)' spinner-class='action.running ? &#39;info&#39; : null' sub-rows='action.subrows' subtitle='action.desc'>\n" +
    "<div class='sk-sublabel' ng-if='action.access_type'>\n" +
    "Uses\n" +
    "<strong>{{action.access_type}}</strong>\n" +
    "access to this note.\n" +
    "</div>\n" +
    "</menu-row>\n" +
    "<menu-row faded='true' label='&#39;No Actions Available&#39;' ng-if='extension.actionsWithContextForItem(item).length == 0'></menu-row>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n"
  );


  $templateCache.put('directives/component-modal.html',
    "<div class='sk-modal-background' ng-click='dismiss()'></div>\n" +
    "<div class='sk-modal-content' ng-attr-id='component-content-outer-{{component.uuid}}'>\n" +
    "<div class='sn-component'>\n" +
    "<div class='sk-panel' ng-attr-id='component-content-inner-{{component.uuid}}'>\n" +
    "<div class='sk-panel-header'>\n" +
    "<div class='sk-panel-header-title'>\n" +
    "{{component.name}}\n" +
    "</div>\n" +
    "<a class='sk-a info close-button' ng-click='dismiss()'>Close</a>\n" +
    "</div>\n" +
    "<component-view class='component-view' component='component'></component-view>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n"
  );


  $templateCache.put('directives/component-view.html',
    "<div class='sn-component' ng-if='issueLoading'>\n" +
    "<div class='sk-app-bar no-edges no-top-edge dynamic-height'>\n" +
    "<div class='left'>\n" +
    "<div class='sk-app-bar-item'>\n" +
    "<div class='sk-label warning'>There was an issue loading {{component.name}}.</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='right'>\n" +
    "<div class='sk-app-bar-item' ng-click='reloadComponent()'>\n" +
    "<div class='sk-button info'>\n" +
    "<div class='sk-label'>Reload</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sn-component' ng-if='showNoThemesMessage'>\n" +
    "<div class='sk-app-bar no-edges no-top-edge dynamic-height'>\n" +
    "<div class='left'>\n" +
    "<div class='sk-app-bar-item'>\n" +
    "<div class='sk-label warning'>This extension does not support themes.</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='right'>\n" +
    "<div class='sk-app-bar-item' ng-click='noThemesMessageDismiss()'>\n" +
    "<div class='sk-label'>Dismiss</div>\n" +
    "</div>\n" +
    "<div class='sk-app-bar-item' ng-click='disableActiveTheme()'>\n" +
    "<div class='sk-label'>Disable Active Theme</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sn-component' ng-if='expired'>\n" +
    "<div class='sk-app-bar no-edges no-top-edge dynamic-height'>\n" +
    "<div class='left'>\n" +
    "<div class='sk-app-bar-item'>\n" +
    "<div class='sk-app-bar-item-column'>\n" +
    "<div class='sk-circle danger small'></div>\n" +
    "</div>\n" +
    "<div class='sk-app-bar-item-column'>\n" +
    "<div>\n" +
    "<a class='sk-label sk-base' href='https://dashboard.standardnotes.org' rel='noopener' target='_blank'>\n" +
    "Your Extended subscription expired on {{component.dateToLocalizedString(component.valid_until)}}.\n" +
    "</a>\n" +
    "<div class='sk-p'>\n" +
    "Extensions are in a read-only state.\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='right'>\n" +
    "<div class='sk-app-bar-item' ng-click='reloadComponent()'>\n" +
    "<div class='sk-button info'>\n" +
    "<div class='sk-label'>Reload</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-app-bar-item'>\n" +
    "<div class='sk-app-bar-item-column'>\n" +
    "<div class='sk-button warning'>\n" +
    "<a class='sk-label' href='https://standardnotes.org/help/41/expired' rel='noopener' target='_blank'>Help</a>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sn-component' ng-if='error == &#39;offline-restricted&#39;'>\n" +
    "<div class='sk-panel static'>\n" +
    "<div class='sk-panel-content'>\n" +
    "<div class='sk-panel-section stretch'>\n" +
    "<div class='sk-panel-column'></div>\n" +
    "<div class='sk-h1 sk-bold'>You have restricted this extension to be used offline only.</div>\n" +
    "<div class='sk-subtitle'>Offline extensions are not available in the Web app.</div>\n" +
    "<div class='sk-panel-row'></div>\n" +
    "<div class='sk-panel-row'>\n" +
    "<div class='sk-panel-column'>\n" +
    "<div class='sk-p'>You can either:</div>\n" +
    "<ul>\n" +
    "<li class='sk-p'><strong>Enable the Hosted option</strong> for this extension by opening the 'Extensions' menu and toggling 'Use hosted when local is unavailable' under this extension's options. Then press Reload below.</li>\n" +
    "<li class='sk-p'><strong>Use the Desktop application.</strong></li>\n" +
    "</ul>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-panel-row'>\n" +
    "<div class='sk-button info' ng-click='reloadStatus()' ng-if='!reloading'>\n" +
    "<div class='sk-label'>Reload</div>\n" +
    "</div>\n" +
    "<div class='sk-spinner info small' ng-if='reloading'></div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sn-component' ng-if='error == &#39;url-missing&#39;'>\n" +
    "<div class='sk-panel static'>\n" +
    "<div class='sk-panel-content'>\n" +
    "<div class='sk-panel-section stretch'>\n" +
    "<div class='sk-panel-section-title'>This extension is not installed correctly.</div>\n" +
    "<p>Please uninstall {{component.name}}, then re-install it.</p>\n" +
    "<p>\n" +
    "This issue can occur if you access Standard Notes using an older version of the app.\n" +
    "Ensure you are running at least version 2.1 on all platforms.\n" +
    "</p>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<iframe data-component-id='{{component.uuid}}' frameBorder='0' ng-attr-id='component-iframe-{{component.uuid}}' ng-if='component &amp;&amp; componentValid' ng-src='{{getUrl() | trusted}}' sandbox='allow-scripts allow-top-navigation-by-user-activation allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-modals allow-forms'>\n" +
    "Loading\n" +
    "</iframe>\n" +
    "<div class='loading-overlay' ng-if='loading'></div>\n"
  );


  $templateCache.put('directives/conflict-resolution-modal.html',
    "<div class='sn-component'>\n" +
    "<div class='sk-modal large' id='conflict-resolution-modal'>\n" +
    "<div class='sk-modal-background'></div>\n" +
    "<div class='sk-modal-content'>\n" +
    "<div class='sk-panel'>\n" +
    "<div class='sk-panel-header'>\n" +
    "<h1 class='sk-panel-header-title'>Conflicted items — choose which version to keep</h1>\n" +
    "<div class='sk-horizontal-group'>\n" +
    "<a class='sk-a info close-button' ng-click='keepItem1()'>Keep left</a>\n" +
    "<a class='sk-a info close-button' ng-click='keepItem2()'>Keep right</a>\n" +
    "<a class='sk-a info close-button' ng-click='keepBoth()'>Keep both</a>\n" +
    "<a class='sk-a info close-button' ng-click='export()'>Export</a>\n" +
    "<a class='sk-a info close-button' ng-click='dismiss(); $event.stopPropagation()'>Close</a>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-panel-content selectable'>\n" +
    "<div class='sk-panel-section'>\n" +
    "<h3>\n" +
    "<strong>Content type:</strong>\n" +
    "{{contentType}}\n" +
    "</h3>\n" +
    "<p>You may wish to look at the \"created_at\" and \"updated_at\" fields of the items to gain better context in deciding which to keep.</p>\n" +
    "</div>\n" +
    "<div id='items'>\n" +
    "<div class='sk-panel static item' id='item1'>\n" +
    "<p class='normal' style='white-space: pre-wrap; font-size: 16px;'>{{item1Content}}</p>\n" +
    "</div>\n" +
    "<div class='border'></div>\n" +
    "<div class='sk-panel static item' id='item2'>\n" +
    "<p class='normal' style='white-space: pre-wrap; font-size: 16px;'>{{item2Content}}</p>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n"
  );


  $templateCache.put('directives/editor-menu.html',
    "<div class='sn-component'>\n" +
    "<div class='sk-menu-panel dropdown-menu'>\n" +
    "<div class='sk-menu-panel-section'>\n" +
    "<div class='sk-menu-panel-header'>\n" +
    "<div class='sk-menu-panel-header-title'>Note Editor</div>\n" +
    "</div>\n" +
    "<menu-row action='selectComponent(null)' circle='selectedEditor == null &amp;&amp; &#39;success&#39;' label='&#39;Plain Editor&#39;'></menu-row>\n" +
    "<menu-row action='selectComponent(editor)' button-action='toggleDefaultForEditor(editor)' button-class='defaultEditor == editor ? &#39;warning&#39; : &#39;info&#39;' button-text='defaultEditor == editor ? &#39;Undefault&#39; : &#39;Set Default&#39;' circle='selectedEditor === editor &amp;&amp; &#39;success&#39;' has-button='selectedEditor == editor || defaultEditor == editor' label='editor.name' ng-repeat='editor in editors'>\n" +
    "<div class='sk-menu-panel-column' ng-if='component.content.conflict_of || shouldDisplayRunningLocallyLabel(editor)'>\n" +
    "<strong class='danger medium-text' ng-if='editor.content.conflict_of'>Conflicted copy</strong>\n" +
    "<div class='sk-sublabel' ng-if='shouldDisplayRunningLocallyLabel(editor)'>Running Locally</div>\n" +
    "</div>\n" +
    "</menu-row>\n" +
    "<a class='no-decoration' href='https://standardnotes.org/extensions' ng-if='editors.length == 0' rel='noopener' target='blank'>\n" +
    "<menu-row label='&#39;Download More Editors&#39;'></menu-row>\n" +
    "</a>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n"
  );


  $templateCache.put('directives/input-modal.html',
    "<div class='sn-component'>\n" +
    "<div class='sk-modal small auto-height'>\n" +
    "<div class='sk-modal-background'></div>\n" +
    "<div class='sk-modal-content'>\n" +
    "<div class='sn-component'>\n" +
    "<div class='sk-panel'>\n" +
    "<div class='sk-panel-header'>\n" +
    "<div class='sk-h1 sk-panel-header-title'>{{title}}</div>\n" +
    "<a class='sk-a info close-button' ng-click='dismiss()'>Close</a>\n" +
    "</div>\n" +
    "<div class='sk-panel-content'>\n" +
    "<div class='sk-panel-section'>\n" +
    "<div class='sk-p sk-panel-row'>{{message}}</div>\n" +
    "<div class='sk-panel-row'>\n" +
    "<div class='sk-panel-column stretch'>\n" +
    "<form ng-submit='submit()'>\n" +
    "<input class='sk-input contrast' ng-model='formData.input' placeholder='{{placeholder}}' should-focus='true' sn-autofocus='true' type='{{type}}'>\n" +
    "</form>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-panel-footer'>\n" +
    "<a class='sk-a info right' ng-click='submit()'>\n" +
    "Submit\n" +
    "</a>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n"
  );


  $templateCache.put('directives/menu-row.html',
    "<div class='sk-menu-panel-row row' ng-attr-title='{{desc}}' ng-click='onClick($event)'>\n" +
    "<div class='sk-menu-panel-column'>\n" +
    "<div class='left'>\n" +
    "<div class='sk-menu-panel-column' ng-if='circle &amp;&amp; (!circleAlign || circleAlign == &#39;left&#39;)'>\n" +
    "<div class='sk-circle small' ng-class='circle'></div>\n" +
    "</div>\n" +
    "<div class='sk-menu-panel-column' ng-class='{&#39;faded&#39; : faded || disabled}'>\n" +
    "<div class='sk-label' ng-class='stylekitClass'>\n" +
    "{{label}}\n" +
    "</div>\n" +
    "<div class='sk-sublabel' ng-if='subtitle'>\n" +
    "{{subtitle}}\n" +
    "</div>\n" +
    "<ng-transclude></ng-transclude>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-menu-panel-subrows' ng-if='subRows &amp;&amp; subRows.length &gt; 0'>\n" +
    "<menu-row action='row.onClick()' label='row.label' ng-repeat='row in subRows' spinner-class='row.spinnerClass' subtitle='row.subtitle'></menu-row>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-menu-panel-column' ng-if='circle &amp;&amp; circleAlign == &#39;right&#39;'>\n" +
    "<div class='sk-circle small' ng-class='circle'></div>\n" +
    "</div>\n" +
    "<div class='sk-menu-panel-column' ng-if='hasButton'>\n" +
    "<div class='sk-button' ng-class='buttonClass' ng-click='clickButton($event)'>\n" +
    "<div class='sk-label'>{{buttonText}}</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-menu-panel-column' ng-if='spinnerClass'>\n" +
    "<div class='sk-spinner small' ng-class='spinnerClass'></div>\n" +
    "</div>\n" +
    "</div>\n"
  );


  $templateCache.put('directives/panel-resizer.html',
    "<div class='panel-resizer-column'></div>\n"
  );


  $templateCache.put('directives/password-wizard.html',
    "<div class='sn-component'>\n" +
    "<div class='sk-modal small auto-height' id='password-wizard'>\n" +
    "<div class='sk-modal-background'></div>\n" +
    "<div class='sk-modal-content'>\n" +
    "<div class='sn-component'>\n" +
    "<div class='sk-panel'>\n" +
    "<div class='sk-panel-header'>\n" +
    "<div class='sk-panel-header-title'>{{title}}</div>\n" +
    "<a class='sk-a info close-button' ng-click='dismiss()'>Close</a>\n" +
    "</div>\n" +
    "<div class='sk-panel-content'>\n" +
    "<div ng-if='step == 0'>\n" +
    "<div ng-if='changePassword'>\n" +
    "<p class='sk-p sk-panel-row'>\n" +
    "Changing your password involves changing your encryption key, which requires your data to be re-encrypted and synced.\n" +
    "If you have many items, syncing your data can take several minutes.\n" +
    "</p>\n" +
    "<p class='sk-p sk-panel-row'>You must keep the application window open during this process.</p>\n" +
    "</div>\n" +
    "<div ng-if='securityUpdate'>\n" +
    "<p class='sk-p sk-panel-row'>\n" +
    "A new update is available for your account. Updates address improvements and enhancements to our security specification.\n" +
    "This process will guide you through the update, and perform the steps necessary with your supervision.\n" +
    "</p>\n" +
    "<div class='sk-panel-row'>\n" +
    "<div class='sk-panel-column'>\n" +
    "<p class='sk-p'>For more information about security updates, please visit</p>\n" +
    "<a class='sk-a info' href='https://standardnotes.org/help/security' rel='noopener' target='_blank'>standardnotes.org/help/security.</a>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<p class='sk-panel-row sk-p'>\n" +
    "<div class='info'>Press Continue to proceed.</div>\n" +
    "</p>\n" +
    "</div>\n" +
    "<div class='sk-panel-section' ng-if='step &gt; 0'>\n" +
    "<div class='sk-panel-section-title'>Step {{step}} — {{titleForStep(step)}}</div>\n" +
    "<div ng-if='step == 1'>\n" +
    "<p class='sk-panel-row sk-p'>\n" +
    "As a result of this process, the entirety of your data will be re-encrypted and synced to your account. This is a generally safe process,\n" +
    "but unforeseen factors like poor network connectivity or a sudden shutdown of your computer may cause this process to fail.\n" +
    "It's best to be on the safe side before large operations such as this one.\n" +
    "</p>\n" +
    "<div class='sk-panel-row'></div>\n" +
    "<div class='sk-panel-row'>\n" +
    "<div class='sk-button-group'>\n" +
    "<div class='sk-button info' ng-click='downloadBackup(true)'>\n" +
    "<div class='sk-label'>Download Encrypted Backup</div>\n" +
    "</div>\n" +
    "<div class='sk-button info' ng-click='downloadBackup(false)'>\n" +
    "<div class='sk-label'>Download Decrypted Backup</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div ng-if='step == 2'>\n" +
    "<p class='sk-p sk-panel-row'>\n" +
    "As a result of this process, your encryption keys will change.\n" +
    "Any device on which you use Standard Notes will need to end its session. After this process completes, you will be asked to sign back in.\n" +
    "</p>\n" +
    "<p class='sk-p bold sk-panel-row info-i'>Please sign out of all applications (excluding this one), including:</p>\n" +
    "<ul>\n" +
    "<li class='sk-p'>Desktop</li>\n" +
    "<li class='sk-p'>Web (Chrome, Firefox, Safari)</li>\n" +
    "<li class='sk-p'>Mobile (iOS and Android)</li>\n" +
    "</ul>\n" +
    "<p class='sk-p sk-panel-row'>\n" +
    "If you do not currently have access to a device you're signed in on, you may proceed,\n" +
    "but must make signing out and back in the first step upon gaining access to that device.\n" +
    "</p>\n" +
    "<p class='sk-p sk-panel-row'>Press Continue only when you have completed signing out of all your devices.</p>\n" +
    "</div>\n" +
    "<div ng-if='step == 3'>\n" +
    "<div ng-if='changePassword'></div>\n" +
    "<div ng-if='securityUpdate'>\n" +
    "<p class='sk-panel-row'>Enter your current password. We'll run this through our encryption scheme to generate strong new encryption keys.</p>\n" +
    "</div>\n" +
    "<div class='sk-panel-row'></div>\n" +
    "<div class='sk-panel-row'>\n" +
    "<div class='sk-panel-column stretch'>\n" +
    "<form class='sk-panel-form'>\n" +
    "<input class='sk-input contrast' ng-model='formData.currentPassword' placeholder='Current Password' should-focus='true' sn-autofocus='true' type='password'>\n" +
    "<input class='sk-input contrast' ng-if='changePassword' ng-model='formData.newPassword' placeholder='New Password' type='password'>\n" +
    "<input class='sk-input contrast' ng-if='changePassword' ng-model='formData.newPasswordConfirmation' placeholder='Confirm New Password' type='password'>\n" +
    "</form>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div ng-if='step == 4'>\n" +
    "<p class='sk-panel-row'>\n" +
    "Your data is being re-encrypted with your new keys and synced to your account.\n" +
    "</p>\n" +
    "<p class='sk-panel-row danger' ng-if='lockContinue'>\n" +
    "Do not close this window until this process completes.\n" +
    "</p>\n" +
    "<div class='sk-panel-row'>\n" +
    "<div class='sk-panel-column'>\n" +
    "<div class='sk-spinner small inline info mr-5' ng-if='formData.processing'></div>\n" +
    "<div class='inline bold' ng-class='{&#39;info&#39; : !formData.statusError, &#39;error&#39; : formData.statusError}'>\n" +
    "{{formData.status}}\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-panel-column' delay-hide='true' delay='1000' show='syncStatus.syncOpInProgress || syncStatus.needsMoreSync'>\n" +
    "<p class='info'>\n" +
    "Syncing {{syncStatus.current}}/{{syncStatus.total}}\n" +
    "</p>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div ng-if='step == 5'>\n" +
    "<div ng-if='changePassword'>\n" +
    "<p class='sk-p sk-panel-row info-i'>Your password has been successfully changed.</p>\n" +
    "</div>\n" +
    "<div ng-if='securityUpdate'>\n" +
    "<p class='sk-p sk-panel-row info-i'>\n" +
    "The security update has been successfully applied to your account.\n" +
    "</p>\n" +
    "</div>\n" +
    "<p class='sk-p sk-panel-row'>\n" +
    "Please ensure you are running the latest version of Standard Notes on all platforms to ensure maximum compatibility.\n" +
    "</p>\n" +
    "<p class='sk-p sk-panel-row'>You may now sign back in on all your devices and close this window.</p>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-panel-footer'>\n" +
    "<div class='empty'></div>\n" +
    "<a class='sk-a info right' ng-class='{&#39;disabled&#39; : lockContinue}' ng-click='continue()' ng-disabled='lockContinue'>\n" +
    "<div class='sk-spinner small inline info mr-5' ng-if='showSpinner'></div>\n" +
    "{{continueTitle}}\n" +
    "</a>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n"
  );


  $templateCache.put('directives/permissions-modal.html',
    "<div class='sk-modal-background' ng-click='deny()'></div>\n" +
    "<div class='sk-modal-content' id='permissions-modal'>\n" +
    "<div class='sn-component'>\n" +
    "<div class='sk-panel'>\n" +
    "<div class='sk-panel-header'>\n" +
    "<div class='sk-panel-header-title'>Activate Extension</div>\n" +
    "<a class='sk-a info close-button' ng-click='deny()'>Cancel</a>\n" +
    "</div>\n" +
    "<div class='sk-panel-content'>\n" +
    "<div class='sk-panel-section'>\n" +
    "<div class='sk-panel-row'>\n" +
    "<div class='sk-h2'>\n" +
    "<strong>{{component.name}}</strong>\n" +
    "would like to interact with your\n" +
    "{{permissionsString}}\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-panel-row'>\n" +
    "<p class='sk-p'>\n" +
    "Extensions use an offline messaging system to communicate. Learn more at\n" +
    "<a class='sk-a info' href='https://standardnotes.org/permissions' rel='noopener' target='_blank'>https://standardnotes.org/permissions.</a>\n" +
    "</p>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-panel-footer'>\n" +
    "<div class='sk-button info big block bold' ng-click='accept()'>\n" +
    "<div class='sk-label'>Continue</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n"
  );


  $templateCache.put('directives/privileges-auth-modal.html',
    "<div class='sk-modal-background' ng-click='cancel()'></div>\n" +
    "<div class='sk-modal-content' id='privileges-modal'>\n" +
    "<div class='sn-component'>\n" +
    "<div class='sk-panel'>\n" +
    "<div class='sk-panel-header'>\n" +
    "<div class='sk-panel-header-title'>Authentication Required</div>\n" +
    "<a class='close-button info' ng-click='cancel()'>Cancel</a>\n" +
    "</div>\n" +
    "<div class='sk-panel-content'>\n" +
    "<div class='sk-panel-section'>\n" +
    "<div ng-repeat='credential in requiredCredentials'>\n" +
    "<div class='sk-p sk-bold sk-panel-row'>\n" +
    "<strong>{{promptForCredential(credential)}}</strong>\n" +
    "</div>\n" +
    "<div class='sk-panel-row'>\n" +
    "<input class='sk-input contrast' ng-model='authenticationParameters[credential]' should-focus='$index == 0' sn-autofocus='true' sn-enter='submit()' type='password'>\n" +
    "</div>\n" +
    "<div class='sk-panel-row'>\n" +
    "<label class='sk-label danger' ng-if='isCredentialInFailureState(credential)'>Invalid authentication. Please try again.</label>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-panel-row'></div>\n" +
    "<div class='sk-panel-row'>\n" +
    "<div class='sk-horizontal-group'>\n" +
    "<div class='sk-p sk-bold'>Remember For</div>\n" +
    "<a class='sk-a info' ng-class='{&#39;boxed&#39; : option.value == selectedSessionLength}' ng-click='selectSessionLength(option.value)' ng-repeat='option in sessionLengthOptions'>\n" +
    "{{option.label}}\n" +
    "</a>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-panel-footer extra-padding'>\n" +
    "<div class='sk-button info big block bold' ng-click='submit()'>\n" +
    "<div class='sk-label'>Submit</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n"
  );


  $templateCache.put('directives/privileges-management-modal.html',
    "<div class='sk-modal-background' ng-click='cancel()'></div>\n" +
    "<div class='sk-modal-content' id='privileges-modal'>\n" +
    "<div class='sn-component'>\n" +
    "<div class='sk-panel'>\n" +
    "<div class='sk-panel-header'>\n" +
    "<div class='sk-panel-header-title'>Manage Privileges</div>\n" +
    "<a class='sk-a close-button info' ng-click='cancel()'>Done</a>\n" +
    "</div>\n" +
    "<div class='sk-panel-content'>\n" +
    "<div class='sk-panel-section'>\n" +
    "<table class='sk-table'>\n" +
    "<thead>\n" +
    "<tr>\n" +
    "<th></th>\n" +
    "<th ng-repeat='cred in availableCredentials'>\n" +
    "<div class='priv-header'>\n" +
    "<strong>{{credentialDisplayInfo[cred].label}}</strong>\n" +
    "<div class='sk-p font-small' ng-show='!credentialDisplayInfo[cred].availability' style='margin-top: 2px'>Not Configured</div>\n" +
    "</div>\n" +
    "</th>\n" +
    "</tr>\n" +
    "</thead>\n" +
    "<tbody>\n" +
    "<tr ng-repeat='action in availableActions'>\n" +
    "<td>\n" +
    "<div class='sk-p'>{{displayInfoForAction(action)}}</div>\n" +
    "</td>\n" +
    "<th ng-repeat='credential in availableCredentials'>\n" +
    "<input ng-checked='isCredentialRequiredForAction(action, credential)' ng-click='checkboxValueChanged(action, credential)' ng-disabled='!credentialDisplayInfo[credential].availability' type='checkbox'>\n" +
    "</th>\n" +
    "</tr>\n" +
    "</tbody>\n" +
    "</table>\n" +
    "</div>\n" +
    "<div class='sk-panel-section' ng-if='sessionExpirey &amp;&amp; !sessionExpired'>\n" +
    "<div class='sk-p sk-panel-row'>You will not be asked to authenticate until {{sessionExpirey}}.</div>\n" +
    "<a class='sk-a sk-panel-row info' ng-click='clearSession()'>Clear Session</a>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-panel-footer'>\n" +
    "<div class='sk-h2 sk-bold'>About Privileges</div>\n" +
    "<div class='sk-panel-section no-bottom-pad'>\n" +
    "<div class='sk-panel-row'>\n" +
    "<div class='text-content'>\n" +
    "<div class='sk-p'>\n" +
    "Privileges represent interface level authentication for accessing certain items and features.\n" +
    "Note that when your application is unlocked, your data exists in temporary memory in an unencrypted state.\n" +
    "Privileges are meant to protect against unwanted access in the event of an unlocked application, but do not affect data encryption state.\n" +
    "</div>\n" +
    "<p class='sk-p'>\n" +
    "Privileges sync across your other devices; however, note that if you require\n" +
    "a \"Local Passcode\" privilege, and another device does not have a local passcode set up, the local passcode\n" +
    "requirement will be ignored on that device.\n" +
    "</p>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n"
  );


  $templateCache.put('directives/revision-preview-modal.html',
    "<div class='sn-component'>\n" +
    "<div class='sk-modal medium' id='item-preview-modal'>\n" +
    "<div class='sk-modal-background'></div>\n" +
    "<div class='sk-modal-content'>\n" +
    "<div class='sn-component'>\n" +
    "<div class='sk-panel'>\n" +
    "<div class='sk-panel-header'>\n" +
    "<div class='sk-panel-header-title'>Preview</div>\n" +
    "<div class='sk-horizontal-group'>\n" +
    "<a class='sk-a info close-button' ng-click='restore(false)'>Restore</a>\n" +
    "<a class='sk-a info close-button' ng-click='restore(true)'>Restore as copy</a>\n" +
    "<a class='sk-a info close-button' ng-click='dismiss(); $event.stopPropagation()'>Close</a>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-panel-content selectable' ng-if='!editor'>\n" +
    "<div class='sk-h2'>{{content.title}}</div>\n" +
    "<p class='normal sk-p' style='white-space: pre-wrap; font-size: 16px;'>{{content.text}}</p>\n" +
    "</div>\n" +
    "<component-view class='component-view' component='editor' ng-if='editor'></component-view>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n"
  );


  $templateCache.put('directives/session-history-menu.html',
    "<div class='sn-component' id='session-history-menu'>\n" +
    "<div class='sk-menu-panel dropdown-menu'>\n" +
    "<div class='sk-menu-panel-header'>\n" +
    "<div class='sk-menu-panel-header-title'>{{history.entries.length || 'No'}} revisions</div>\n" +
    "<a class='sk-a info sk-h5' ng-click='showOptions = !showOptions; $event.stopPropagation();'>Options</a>\n" +
    "</div>\n" +
    "<div ng-if='showOptions'>\n" +
    "<menu-row action='clearItemHistory()' label='&#39;Clear note local history&#39;'></menu-row>\n" +
    "<menu-row action='clearAllHistory()' label='&#39;Clear all local history&#39;'></menu-row>\n" +
    "<menu-row action='toggleAutoOptimize()' label='(autoOptimize ? &#39;Disable&#39; : &#39;Enable&#39;) + &#39; auto cleanup&#39;'>\n" +
    "<div class='sk-sublabel'>\n" +
    "Automatically cleans up small revisions to conserve space.\n" +
    "</div>\n" +
    "</menu-row>\n" +
    "<menu-row action='toggleDiskSaving()' label='(diskEnabled ? &#39;Disable&#39; : &#39;Enable&#39;) + &#39; saving history to disk&#39;'>\n" +
    "<div class='sk-sublabel'>\n" +
    "Saving to disk is not recommended. Decreases performance and increases app loading time and memory footprint.\n" +
    "</div>\n" +
    "</menu-row>\n" +
    "</div>\n" +
    "<menu-row action='openRevision(revision);' label='revision.previewTitle()' ng-repeat='revision in entries'>\n" +
    "<div class='sk-sublabel opaque' ng-class='classForRevision(revision)'>\n" +
    "{{revision.previewSubTitle()}}\n" +
    "</div>\n" +
    "</menu-row>\n" +
    "</div>\n" +
    "</div>\n"
  );


  $templateCache.put('directives/sync-resolution-menu.html',
    "<div class='sn-component'>\n" +
    "<div class='sk-panel sk-panel-right' id='sync-resolution-menu'>\n" +
    "<div class='sk-panel-header'>\n" +
    "<div class='sk-panel-header-title'>Out of Sync</div>\n" +
    "<a class='sk-a info close-button' ng-click='close()'>Close</a>\n" +
    "</div>\n" +
    "<div class='sk-panel-content'>\n" +
    "<div class='sk-panel-section'>\n" +
    "<div class='sk-panel-row sk-p'>\n" +
    "We've detected that the data on the server may not match the data in the current application session.\n" +
    "</div>\n" +
    "<div class='sk-p sk-panel-row'>\n" +
    "<div class='sk-panel-column'>\n" +
    "<strong class='sk-panel-row'>Option 1 — Restart App:</strong>\n" +
    "<div class='sk-p'>Quit the application and re-open it. Sometimes, this may resolve the issue.</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-p sk-panel-row'>\n" +
    "<div class='sk-panel-column'>\n" +
    "<strong class='sk-panel-row'>Option 2 (recommended) — Sign Out:</strong>\n" +
    "<div class='sk-p'>Sign out of your account, then sign back in. This will ensure your data is consistent with the server.</div>\n" +
    "Be sure to download a backup of your data before doing so.\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-p sk-panel-row'>\n" +
    "<div class='sk-panel-column'>\n" +
    "<strong class='sk-panel-row'>Option 3 — Sync Resolution:</strong>\n" +
    "<div class='sk-p'>\n" +
    "We can attempt to reconcile changes by downloading all data from the server.\n" +
    "</div>\n" +
    "No existing data will be overwritten. If the local contents of an item differ from what the server has,\n" +
    "a conflicted copy will be created.\n" +
    "</div>\n" +
    "</div>\n" +
    "<div ng-if='!status.backupFinished'>\n" +
    "<div class='sk-p sk-panel-row'>\n" +
    "Please download a backup before we attempt to perform a full account sync resolution.\n" +
    "</div>\n" +
    "<div class='sk-panel-row'>\n" +
    "<div class='sk-button-group'>\n" +
    "<div class='sk-button info' ng-click='downloadBackup(true)'>\n" +
    "<div class='sk-label'>Encrypted</div>\n" +
    "</div>\n" +
    "<div class='sk-button info' ng-click='downloadBackup(false)'>\n" +
    "<div class='sk-label'>Decrypted</div>\n" +
    "</div>\n" +
    "<div class='sk-button danger' ng-click='skipBackup()'>\n" +
    "<div class='sk-label'>Skip</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div ng-if='status.backupFinished'>\n" +
    "<div class='sk-panel-row' ng-if='!status.resolving &amp;&amp; !status.attemptedResolution'>\n" +
    "<div class='sk-button info' ng-click='performSyncResolution()'>\n" +
    "<div class='sk-label'>Perform Sync Resolution</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-panel-row justify-left' ng-if='status.resolving'>\n" +
    "<div class='sk-horizontal-group'>\n" +
    "<div class='sk-spinner small info'></div>\n" +
    "<div class='sk-label'>Attempting sync resolution...</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-panel-column' ng-if='status.fail'>\n" +
    "<div class='sk-panel-row sk-label danger'>Sync Resolution Failed</div>\n" +
    "<div class='sk-p sk-panel-row'>\n" +
    "We attempted to reconcile local content and server content, but were unable to do so.\n" +
    "At this point, we recommend signing out of your account and signing back in. You may\n" +
    "wish to download a data backup before doing so.\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-panel-column' ng-if='status.success'>\n" +
    "<div class='sk-panel-row sk-label success'>Sync Resolution Success</div>\n" +
    "<div class='sk-p sk-panel-row'>\n" +
    "Your local data is now in sync with the server. You may close this window.\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n"
  );


  $templateCache.put('editor.html',
    "<div aria-label='Note' class='section editor sn-component' id='editor-column'>\n" +
    "<div class='sn-component'>\n" +
    "<div class='sk-app-bar no-edges' ng-if='ctrl.note.locked' ng-init='ctrl.lockText = &#39;Note Locked&#39;' ng-mouseleave='ctrl.lockText = &#39;Note Locked&#39;' ng-mouseover='ctrl.lockText = &#39;Unlock&#39;'>\n" +
    "<div class='left'>\n" +
    "<div class='sk-app-bar-item' ng-click='ctrl.toggleLockNote()'>\n" +
    "<div class='sk-label warning'>\n" +
    "<i class='icon ion-locked'></i>\n" +
    "{{ctrl.lockText}}\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='section-title-bar' id='editor-title-bar' ng-class='{&#39;locked&#39; : ctrl.note.locked }' ng-show='ctrl.note &amp;&amp; !ctrl.note.errorDecrypting'>\n" +
    "<div class='title'>\n" +
    "<input class='input' id='note-title-editor' ng-blur='ctrl.onNameBlur()' ng-change='ctrl.onTitleChange()' ng-disabled='ctrl.note.locked' ng-focus='ctrl.onNameFocus()' ng-keyup='$event.keyCode == 13 &amp;&amp; ctrl.onTitleEnter($event)' ng-model='ctrl.note.title' select-on-click='true' spellcheck='false'>\n" +
    "</div>\n" +
    "<div id='save-status'>\n" +
    "<div class='message' ng-class='{&#39;warning sk-bold&#39;: ctrl.syncTakingTooLong, &#39;danger sk-bold&#39;: ctrl.saveError}'>{{ctrl.noteStatus.message}}</div>\n" +
    "<div class='desc' ng-show='ctrl.noteStatus.desc'>{{ctrl.noteStatus.desc}}</div>\n" +
    "</div>\n" +
    "<div class='editor-tags'>\n" +
    "<div id='note-tags-component-container' ng-if='ctrl.tagsComponent'>\n" +
    "<component-view class='component-view' component='ctrl.tagsComponent' ng-class='{&#39;locked&#39; : ctrl.note.locked }' ng-style='ctrl.note.locked &amp;&amp; {&#39;pointer-events&#39; : &#39;none&#39;}'></component-view>\n" +
    "</div>\n" +
    "<input class='tags-input' ng-blur='ctrl.updateTagsFromTagsString($event, ctrl.tagsString)' ng-disabled='ctrl.note.locked' ng-if='!(ctrl.tagsComponent &amp;&amp; ctrl.tagsComponent.active)' ng-keyup='$event.keyCode == 13 &amp;&amp; $event.target.blur();' ng-model='ctrl.tagsString' placeholder='#tags' spellcheck='false' type='text'>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sn-component' ng-if='ctrl.note'>\n" +
    "<div class='sk-app-bar no-edges' id='editor-menu-bar'>\n" +
    "<div class='left'>\n" +
    "<div class='sk-app-bar-item' click-outside='ctrl.showMenu = false;' is-open='ctrl.showMenu' ng-class='{&#39;selected&#39; : ctrl.showMenu}' ng-click='ctrl.toggleMenu(&#39;showMenu&#39;)'>\n" +
    "<div class='sk-label'>Options</div>\n" +
    "<div class='sk-menu-panel dropdown-menu' ng-if='ctrl.showMenu'>\n" +
    "<div class='sk-menu-panel-section'>\n" +
    "<div class='sk-menu-panel-header'>\n" +
    "<div class='sk-menu-panel-header-title'>Note Options</div>\n" +
    "</div>\n" +
    "<menu-row action='ctrl.selectedMenuItem(true); ctrl.togglePin()' desc='&#39;Pin or unpin a note from the top of your list&#39;' label='ctrl.note.pinned ? &#39;Unpin&#39; : &#39;Pin&#39;'></menu-row>\n" +
    "<menu-row action='ctrl.selectedMenuItem(true); ctrl.toggleArchiveNote()' desc='&#39;Archive or unarchive a note from your Archived system tag&#39;' label='ctrl.note.archived ? &#39;Unarchive&#39; : &#39;Archive&#39;'></menu-row>\n" +
    "<menu-row action='ctrl.selectedMenuItem(true); ctrl.toggleLockNote()' desc='&#39;Locking notes prevents unintentional editing&#39;' label='ctrl.note.locked ? &#39;Unlock&#39; : &#39;Lock&#39;'></menu-row>\n" +
    "<menu-row action='ctrl.selectedMenuItem(true); ctrl.toggleProtectNote()' desc='&#39;Protecting a note will require credentials to view it (Manage Privileges via Account menu)&#39;' label='ctrl.note.content.protected ? &#39;Unprotect&#39; : &#39;Protect&#39;'></menu-row>\n" +
    "<menu-row action='ctrl.selectedMenuItem(true); ctrl.toggleNotePreview()' circle-align='&#39;right&#39;' circle='ctrl.note.content.hidePreview ? &#39;danger&#39; : &#39;success&#39;' desc='&#39;Hide or unhide the note preview from the list of notes&#39;' label='&#39;Preview&#39;'></menu-row>\n" +
    "<menu-row action='ctrl.selectedMenuItem(); ctrl.deleteNote()' desc='&#39;Send this note to the trash&#39;' label='&#39;Move to Trash&#39;' ng-show='!ctrl.altKeyDown &amp;&amp; !ctrl.note.content.trashed &amp;&amp; !ctrl.note.errorDecrypting' stylekit-class='&#39;warning&#39;'></menu-row>\n" +
    "<menu-row action='ctrl.selectedMenuItem(); ctrl.deleteNotePermanantely()' desc='&#39;Delete this note permanently from all your devices&#39;' label='&#39;Delete Permanently&#39;' ng-show='!ctrl.note.content.trashed &amp;&amp; ctrl.note.errorDecrypting' stylekit-class='&#39;danger&#39;'></menu-row>\n" +
    "</div>\n" +
    "<div ng-if='ctrl.note.content.trashed || ctrl.altKeyDown'>\n" +
    "<menu-row action='ctrl.selectedMenuItem(true); ctrl.restoreTrashedNote()' desc='&#39;Undelete this note and restore it back into your notes&#39;' label='&#39;Restore&#39;' ng-show='ctrl.note.content.trashed' stylekit-class='&#39;info&#39;'></menu-row>\n" +
    "<menu-row action='ctrl.selectedMenuItem(true); ctrl.deleteNotePermanantely()' desc='&#39;Delete this note permanently from all your devices&#39;' label='&#39;Delete Permanently&#39;' stylekit-class='&#39;danger&#39;'></menu-row>\n" +
    "<menu-row action='ctrl.selectedMenuItem(true); ctrl.emptyTrash()' desc='&#39;Permanently delete all notes in the trash&#39;' label='&#39;Empty Trash&#39;' ng-show='ctrl.note.content.trashed || !ctrl.altKeyDown' stylekit-class='&#39;danger&#39;' subtitle='ctrl.getTrashCount() + &#39; notes in trash&#39;'></menu-row>\n" +
    "</div>\n" +
    "<div class='sk-menu-panel-section'>\n" +
    "<div class='sk-menu-panel-header'>\n" +
    "<div class='sk-menu-panel-header-title'>Global Display</div>\n" +
    "</div>\n" +
    "<menu-row action='ctrl.selectedMenuItem(true); ctrl.toggleKey(&#39;monospaceFont&#39;)' circle='ctrl.monospaceFont ? &#39;success&#39; : &#39;neutral&#39;' desc='&#39;Toggles the font style for the default editor&#39;' disabled='ctrl.selectedEditor' label='&#39;Monospace Font&#39;' subtitle='ctrl.selectedEditor ? &#39;Not available with editor extensions&#39; : null'></menu-row>\n" +
    "<menu-row action='ctrl.selectedMenuItem(true); ctrl.toggleKey(&#39;spellcheck&#39;)' circle='ctrl.spellcheck ? &#39;success&#39; : &#39;neutral&#39;' desc='&#39;Toggles spellcheck for the default editor&#39;' disabled='ctrl.selectedEditor' label='&#39;Spellcheck&#39;' subtitle='ctrl.selectedEditor ? &#39;Not available with editor extensions&#39; : (ctrl.isDesktop ? &#39;May degrade editor performance&#39; : null)'></menu-row>\n" +
    "<menu-row action='ctrl.selectedMenuItem(true); ctrl.toggleKey(&#39;marginResizersEnabled&#39;)' circle='ctrl.marginResizersEnabled ? &#39;success&#39; : &#39;neutral&#39;' desc='&#39;Allows for editor left and right margins to be resized&#39;' faded='!ctrl.marginResizersEnabled' label='&#39;Margin Resizers&#39;'></menu-row>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-app-bar-item' click-outside='ctrl.showEditorMenu = false;' is-open='ctrl.showEditorMenu' ng-class='{&#39;selected&#39; : ctrl.showEditorMenu}' ng-click='ctrl.toggleMenu(&#39;showEditorMenu&#39;)'>\n" +
    "<div class='sk-label'>Editor</div>\n" +
    "<editor-menu callback='ctrl.editorMenuOnSelect' current-item='ctrl.note' ng-if='ctrl.showEditorMenu' selected-editor='ctrl.selectedEditor'></editor-menu>\n" +
    "</div>\n" +
    "<div class='sk-app-bar-item' click-outside='ctrl.showExtensions = false;' is-open='ctrl.showExtensions' ng-class='{&#39;selected&#39; : ctrl.showExtensions}' ng-click='ctrl.toggleMenu(&#39;showExtensions&#39;)'>\n" +
    "<div class='sk-label'>Actions</div>\n" +
    "<actions-menu item='ctrl.note' ng-if='ctrl.showExtensions'></actions-menu>\n" +
    "</div>\n" +
    "<div class='sk-app-bar-item' click-outside='ctrl.showSessionHistory = false;' is-open='ctrl.showSessionHistory' ng-click='ctrl.toggleMenu(&#39;showSessionHistory&#39;)'>\n" +
    "<div class='sk-label'>Session History</div>\n" +
    "<session-history-menu item='ctrl.note' ng-if='ctrl.showSessionHistory'></session-history-menu>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='editor-content' id='editor-content' ng-if='ctrl.noteReady &amp;&amp; !ctrl.note.errorDecrypting'>\n" +
    "<panel-resizer class='left' control='ctrl.leftResizeControl' hoverable='true' min-width='300' ng-if='ctrl.marginResizersEnabled' on-resize-finish='ctrl.onPanelResizeFinish' panel-id='&#39;editor-content&#39;' property='&#39;left&#39;'></panel-resizer>\n" +
    "<component-view class='component-view' component='ctrl.selectedEditor' ng-if='ctrl.selectedEditor' on-load='ctrl.onEditorLoad'></component-view>\n" +
    "<textarea class='editable' dir='auto' id='note-text-editor' ng-attr-spellcheck='{{ctrl.spellcheck}}' ng-change='ctrl.contentChanged()' ng-click='ctrl.clickedTextArea()' ng-focus='ctrl.onContentFocus()' ng-if='!ctrl.selectedEditor' ng-model-options='{ debounce: ctrl.EditorNgDebounce }' ng-model='ctrl.note.text' ng-readonly='ctrl.note.locked' ng-trim='false'>{{ctrl.onSystemEditorLoad()}}</textarea>\n" +
    "<panel-resizer control='ctrl.rightResizeControl' hoverable='true' min-width='300' ng-if='ctrl.marginResizersEnabled' on-resize-finish='ctrl.onPanelResizeFinish' panel-id='&#39;editor-content&#39;' property='&#39;right&#39;'></panel-resizer>\n" +
    "</div>\n" +
    "<div class='section' ng-show='ctrl.note.errorDecrypting'>\n" +
    "<p class='medium-padding' style='padding-top: 0 !important;'>There was an error decrypting this item. Ensure you are running the latest version of this app, then sign out and sign back in to try again.</p>\n" +
    "</div>\n" +
    "<div id='editor-pane-component-stack' ng-show='ctrl.note'>\n" +
    "<div class='sk-app-bar no-edges' id='component-stack-menu-bar' ng-if='ctrl.componentStack.length'>\n" +
    "<div class='left'>\n" +
    "<div class='sk-app-bar-item' ng-click='ctrl.toggleStackComponentForCurrentItem(component)' ng-repeat='component in ctrl.componentStack'>\n" +
    "<div class='sk-app-bar-item-column'>\n" +
    "<div class='sk-circle small' ng-class='{&#39;info&#39; : !component.hidden &amp;&amp; component.active, &#39;neutral&#39; : component.hidden  || !component.active}'></div>\n" +
    "</div>\n" +
    "<div class='sk-app-bar-item-column'>\n" +
    "<div class='sk-label'>{{component.name}}</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sn-component'>\n" +
    "<component-view class='component-view component-stack-item' component='component' manual-dealloc='true' ng-if='component.active' ng-repeat='component in ctrl.componentStack' ng-show='!component.hidden'></component-view>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n"
  );


  $templateCache.put('footer.html',
    "<div class='sn-component'>\n" +
    "<div class='sk-app-bar no-edges no-bottom-edge' id='footer-bar'>\n" +
    "<div class='left'>\n" +
    "<div class='sk-app-bar-item' click-outside='ctrl.clickOutsideAccountMenu()' is-open='ctrl.showAccountMenu' ng-click='ctrl.accountMenuPressed()'>\n" +
    "<div class='sk-app-bar-item-column'>\n" +
    "<div class='sk-circle small' ng-class='ctrl.error ? &#39;danger&#39; : (ctrl.getUser() ? &#39;info&#39; : &#39;neutral&#39;)'></div>\n" +
    "</div>\n" +
    "<div class='sk-app-bar-item-column'>\n" +
    "<div class='sk-label title' ng-class='{red: ctrl.error}'>Account</div>\n" +
    "</div>\n" +
    "<account-menu close-function='ctrl.closeAccountMenu' ng-click='$event.stopPropagation()' ng-if='ctrl.showAccountMenu' on-successful-auth='ctrl.onAuthSuccess'></account-menu>\n" +
    "</div>\n" +
    "<div class='sk-app-bar-item'>\n" +
    "<a class='no-decoration sk-label title' href='https://standardnotes.org/help' rel='noopener' target='_blank'>\n" +
    "Help\n" +
    "</a>\n" +
    "</div>\n" +
    "<div class='sk-app-bar-item border'></div>\n" +
    "<div class='sk-app-bar-item' ng-repeat='room in ctrl.rooms track by room.uuid'>\n" +
    "<div class='sk-app-bar-item-column' ng-click='ctrl.selectRoom(room)'>\n" +
    "<div class='sk-label'>{{room.name}}</div>\n" +
    "</div>\n" +
    "<component-modal component='room' ng-if='room.showRoom' on-dismiss='ctrl.onRoomDismiss'></component-modal>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='center'>\n" +
    "<div class='sk-app-bar-item' ng-show='ctrl.arbitraryStatusMessage'>\n" +
    "<div class='sk-app-bar-item-column'>\n" +
    "<span class='neutral sk-label'>{{ctrl.arbitraryStatusMessage}}</span>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='right'>\n" +
    "<div class='sk-app-bar-item' ng-click='ctrl.openSecurityUpdate()' ng-show='ctrl.securityUpdateAvailable'>\n" +
    "<span class='success sk-label'>Security update available.</span>\n" +
    "</div>\n" +
    "<div class='sk-app-bar-item' ng-click='ctrl.clickedNewUpdateAnnouncement()' ng-show='ctrl.newUpdateAvailable == true'>\n" +
    "<span class='info sk-label'>New update available.</span>\n" +
    "</div>\n" +
    "<div class='sk-app-bar-item no-pointer' ng-if='ctrl.lastSyncDate &amp;&amp; !ctrl.isRefreshing'>\n" +
    "<div class='sk-label subtle'>\n" +
    "Last refreshed {{ctrl.lastSyncDate | appDateTime}}\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-app-bar-item' ng-click='ctrl.toggleSyncResolutionMenu()' ng-if='(ctrl.outOfSync &amp;&amp; !ctrl.isRefreshing) || ctrl.showSyncResolution'>\n" +
    "<div class='sk-label warning' ng-if='ctrl.outOfSync'>Potentially Out of Sync</div>\n" +
    "<sync-resolution-menu close-function='ctrl.toggleSyncResolutionMenu' ng-click='$event.stopPropagation();' ng-if='ctrl.showSyncResolution'></sync-resolution-menu>\n" +
    "</div>\n" +
    "<div class='sk-app-bar-item' ng-if='ctrl.lastSyncDate &amp;&amp; ctrl.isRefreshing'>\n" +
    "<div class='sk-spinner small'></div>\n" +
    "</div>\n" +
    "<div class='sk-app-bar-item' ng-if='ctrl.offline'>\n" +
    "<div class='sk-label'>Offline</div>\n" +
    "</div>\n" +
    "<div class='sk-app-bar-item' ng-click='ctrl.refreshData()' ng-if='!ctrl.offline'>\n" +
    "<div class='sk-label'>Refresh</div>\n" +
    "</div>\n" +
    "<div class='sk-app-bar-item border' ng-if='ctrl.dockShortcuts.length &gt; 0'></div>\n" +
    "<div class='sk-app-bar-item dock-shortcut' ng-repeat='shortcut in ctrl.dockShortcuts'>\n" +
    "<div class='sk-app-bar-item-column' ng-class='{&#39;underline&#39;: shortcut.component.active}' ng-click='ctrl.selectShortcut(shortcut)'>\n" +
    "<div class='div' ng-if='shortcut.icon.type == &#39;circle&#39;'>\n" +
    "<div class='sk-circle small' ng-style='{&#39;background-color&#39;: shortcut.icon.background_color, &#39;border-color&#39;: shortcut.icon.border_color}'></div>\n" +
    "</div>\n" +
    "<div class='div' ng-if='shortcut.icon.type == &#39;svg&#39;'>\n" +
    "<div class='svg-item' elem-ready='ctrl.initSvgForShortcut(shortcut)' ng-attr-id='dock-svg-{{shortcut.component.uuid}}'></div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-app-bar-item border' ng-if='ctrl.hasPasscode()'></div>\n" +
    "<div class='sk-app-bar-item' id='lock-item' ng-click='ctrl.lockApp()' ng-if='ctrl.hasPasscode()' title='Locks application and wipes unencrypted data from memory.'>\n" +
    "<div class='sk-label'>\n" +
    "<i class='icon ion-locked' id='footer-lock-icon'></i>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n"
  );


  $templateCache.put('home.html',
    "<div class='main-ui-view' ng-class='platform'>\n" +
    "<lock-screen ng-if='needsUnlock' on-success='onSuccessfulUnlock'></lock-screen>\n" +
    "<div class='app' id='app' ng-class='appClass' ng-if='!needsUnlock'>\n" +
    "<tags-section add-new='tagsAddNew' remove-tag='removeTag' save='tagsSave' selection-made='tagsSelectionMade'></tags-section>\n" +
    "<notes-section add-new='notesAddNew' selection-made='notesSelectionMade' tag='selectedTag'></notes-section>\n" +
    "<editor-section note='selectedNote' remove='deleteNote' update-tags='updateTagsForNote'></editor-section>\n" +
    "</div>\n" +
    "<footer ng-if='!needsUnlock'></footer>\n" +
    "</div>\n"
  );


  $templateCache.put('lock-screen.html',
    "<div class='sn-component' id='lock-screen'>\n" +
    "<div class='sk-panel'>\n" +
    "<div class='sk-panel-header'>\n" +
    "<div class='sk-panel-header-title'>Passcode Required</div>\n" +
    "</div>\n" +
    "<div class='sk-panel-content'>\n" +
    "<div class='sk-panel-section'>\n" +
    "<form class='sk-panel-form sk-panel-row' ng-submit='submitPasscodeForm()'>\n" +
    "<div class='sk-panel-column stretch'>\n" +
    "<input autocomplete='new-password' autofocus='true' class='center-text sk-input contrast' id='passcode-input' ng-model='formData.passcode' placeholder='Enter Passcode' should-focus='true' sn-autofocus='true' type='password'>\n" +
    "<div class='sk-button-group stretch sk-panel-row form-submit'>\n" +
    "<button class='sk-button info' type='submit'>\n" +
    "<div class='sk-label'>Unlock</div>\n" +
    "</button>\n" +
    "</div>\n" +
    "</div>\n" +
    "</form>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-panel-footer'>\n" +
    "<div id='passcode-reset'>\n" +
    "<a class='sk-a neutral' ng-click='forgotPasscode()' ng-if='!formData.showRecovery'>Forgot?</a>\n" +
    "<div ng-if='formData.showRecovery'>\n" +
    "<div class='sk-p'>\n" +
    "If you forgot your local passcode, your only option is to clear your local data from this device\n" +
    "and sign back in to your account.\n" +
    "</div>\n" +
    "<div class='sk-panel-row'></div>\n" +
    "<a class='sk-a danger center-text' ng-click='beginDeleteData()'>Delete Local Data</a>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n"
  );


  $templateCache.put('notes.html',
    "<div aria-label='Notes' class='sn-component section notes' id='notes-column'>\n" +
    "<div class='content'>\n" +
    "<div class='section-title-bar' id='notes-title-bar'>\n" +
    "<div class='padded'>\n" +
    "<div class='section-title-bar-header'>\n" +
    "<div class='title'>{{ctrl.panelTitle}}</div>\n" +
    "<div class='sk-button contrast wide' ng-click='ctrl.createNewNote()' title='Create a new note in the selected tag'>\n" +
    "<div class='sk-label'>\n" +
    "<i class='icon ion-plus add-button'></i>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='filter-section' role='search'>\n" +
    "<input class='filter-bar' id='search-bar' lowercase='true' ng-blur='ctrl.onFilterEnter()' ng-change='ctrl.filterTextChanged()' ng-keyup='$event.keyCode == 13 &amp;&amp; ctrl.onFilterEnter();' ng-model='ctrl.noteFilter.text' placeholder='Search' select-on-click='true' title='Searches notes in the currently selected tag'>\n" +
    "<div id='search-clear-button' ng-click='ctrl.clearFilterText();' ng-show='ctrl.noteFilter.text'>✕</div>\n" +
    "</input>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sn-component' id='notes-menu-bar'>\n" +
    "<div class='sk-app-bar no-edges'>\n" +
    "<div class='left'>\n" +
    "<div class='sk-app-bar-item' ng-class='{&#39;selected&#39; : ctrl.showMenu}' ng-click='ctrl.showMenu = !ctrl.showMenu'>\n" +
    "<div class='sk-app-bar-item-column'>\n" +
    "<div class='sk-label'>\n" +
    "Options\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-app-bar-item-column'>\n" +
    "<div class='sk-sublabel'>{{ctrl.optionsSubtitle()}}</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='sk-menu-panel dropdown-menu' id='notes-options-menu' ng-show='ctrl.showMenu'>\n" +
    "<div class='sk-menu-panel-header'>\n" +
    "<div class='sk-menu-panel-header-title'>Sort By</div>\n" +
    "<a class='info sk-h5' ng-click='ctrl.toggleReverseSort()'>\n" +
    "{{ctrl.sortReverse === true ? 'Disable Reverse Sort' : 'Enable Reverse Sort'}}\n" +
    "</a>\n" +
    "</div>\n" +
    "<menu-row action='ctrl.selectedMenuItem(); ctrl.selectedSortByCreated()' circle='ctrl.sortBy == &#39;created_at&#39; &amp;&amp; &#39;success&#39;' desc='&#39;Sort notes by newest first&#39;' label='&#39;Date Added&#39;'></menu-row>\n" +
    "<menu-row action='ctrl.selectedMenuItem(); ctrl.selectedSortByUpdated()' circle='ctrl.sortBy == &#39;client_updated_at&#39; &amp;&amp; &#39;success&#39;' desc='&#39;Sort notes with the most recently updated first&#39;' label='&#39;Date Modified&#39;'></menu-row>\n" +
    "<menu-row action='ctrl.selectedMenuItem(); ctrl.selectedSortByTitle()' circle='ctrl.sortBy == &#39;title&#39; &amp;&amp; &#39;success&#39;' desc='&#39;Sort notes alphabetically by their title&#39;' label='&#39;Title&#39;'></menu-row>\n" +
    "<div class='sk-menu-panel-section'>\n" +
    "<div class='sk-menu-panel-header'>\n" +
    "<div class='sk-menu-panel-header-title'>Display</div>\n" +
    "</div>\n" +
    "<menu-row action='ctrl.selectedMenuItem(); ctrl.togglePrefKey(&#39;showArchived&#39;)' circle='ctrl.showArchived ? &#39;success&#39; : &#39;danger&#39;' desc='&#39;Archived notes are usually hidden. You can explicitly show them with this option.&#39;' faded='!ctrl.showArchived' label='&#39;Archived Notes&#39;'></menu-row>\n" +
    "<menu-row action='ctrl.selectedMenuItem(); ctrl.togglePrefKey(&#39;hidePinned&#39;)' circle='ctrl.hidePinned ? &#39;danger&#39; : &#39;success&#39;' desc='&#39;Pinned notes always appear on top. You can hide them temporarily with this option so you can focus on other notes in the list.&#39;' faded='ctrl.hidePinned' label='&#39;Pinned Notes&#39;'></menu-row>\n" +
    "<menu-row action='ctrl.selectedMenuItem(); ctrl.togglePrefKey(&#39;hideNotePreview&#39;)' circle='ctrl.hideNotePreview ? &#39;danger&#39; : &#39;success&#39;' desc='&#39;Hide the note preview for a more condensed list of notes&#39;' faded='ctrl.hideNotePreview' label='&#39;Note Preview&#39;'></menu-row>\n" +
    "<menu-row action='ctrl.selectedMenuItem(); ctrl.togglePrefKey(&#39;hideDate&#39;)' circle='ctrl.hideDate ? &#39;danger&#39; : &#39;success&#39;' desc='&#39;Hide the date displayed in each row&#39;' faded='ctrl.hideDate' label='&#39;Date&#39;'></menu-row>\n" +
    "<menu-row action='ctrl.selectedMenuItem(); ctrl.togglePrefKey(&#39;hideTags&#39;)' circle='ctrl.hideTags ? &#39;danger&#39; : &#39;success&#39;' desc='&#39;Hide the list of tags associated with each note&#39;' faded='ctrl.hideTags' label='&#39;Tags&#39;'></menu-row>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='scrollable'>\n" +
    "<div can-load='true' class='infinite-scroll' id='notes-scrollable' infinite-scroll='ctrl.paginate()' threshold='200'>\n" +
    "<div class='note' ng-class='{&#39;selected&#39; : ctrl.selectedNote == note}' ng-click='ctrl.selectNote(note, true)' ng-repeat='note in (ctrl.renderedNotes = (ctrl.notes | limitTo:ctrl.notesToDisplay)) track by note.uuid'>\n" +
    "<div class='note-flags' ng-show='note.flags.length &gt; 0'>\n" +
    "<div class='flag' ng-class='flag.class' ng-repeat='flag in note.flags'>\n" +
    "<div class='label'>{{flag.text}}</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='name' ng-show='note.title'>\n" +
    "{{note.title}}\n" +
    "</div>\n" +
    "<div class='note-preview' ng-if='!ctrl.hideNotePreview &amp;&amp; !note.content.hidePreview &amp;&amp; !note.content.protected'>\n" +
    "<div class='html-preview' ng-bind-html='note.content.preview_html' ng-show='note.content.preview_html'></div>\n" +
    "<div class='plain-preview' ng-show='!note.content.preview_html &amp;&amp; note.content.preview_plain'>{{note.content.preview_plain}}</div>\n" +
    "<div class='default-preview' ng-show='!note.content.preview_html &amp;&amp; !note.content.preview_plain'>{{note.text}}</div>\n" +
    "</div>\n" +
    "<div class='date faded' ng-show='!ctrl.hideDate'>\n" +
    "<span ng-show='ctrl.sortBy == &#39;client_updated_at&#39;'>Modified {{note.cachedUpdatedAtString || 'Now'}}</span>\n" +
    "<span ng-show='ctrl.sortBy != &#39;client_updated_at&#39;'>{{note.cachedCreatedAtString || 'Now'}}</span>\n" +
    "</div>\n" +
    "<div class='tags-string' ng-show='note.shouldShowTags'>\n" +
    "<div class='faded'>{{note.savedTagsString || note.tagsString()}}</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<panel-resizer collapsable='true' control='ctrl.panelController' default-width='300' hoverable='true' on-resize-finish='ctrl.onPanelResize' panel-id='&#39;notes-column&#39;'></panel-resizer>\n" +
    "</div>\n"
  );


  $templateCache.put('tags.html',
    "<div aria-label='Tags' class='sn-component section tags' id='tags-column'>\n" +
    "<div class='component-view-container' ng-if='ctrl.component.active'>\n" +
    "<component-view class='component-view' component='ctrl.component'></component-view>\n" +
    "</div>\n" +
    "<div class='content' id='tags-content' ng-if='!(ctrl.component &amp;&amp; ctrl.component.active)'>\n" +
    "<div class='tags-title-section section-title-bar'>\n" +
    "<div class='section-title-bar-header'>\n" +
    "<div class='sk-h3 title'>\n" +
    "<span class='sk-bold'>Views</span>\n" +
    "</div>\n" +
    "<div class='sk-button sk-secondary-contrast wide' ng-click='ctrl.clickedAddNewTag()' title='Create a new tag'>\n" +
    "<div class='sk-label'>\n" +
    "<i class='icon ion-plus add-button'></i>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='scrollable'>\n" +
    "<div class='infinite-scroll'>\n" +
    "<div class='tag' ng-class='{&#39;selected&#39; : ctrl.selectedTag == tag, &#39;faded&#39; : !tag.content.isAllTag}' ng-click='ctrl.selectTag(tag)' ng-repeat='tag in ctrl.smartTags'>\n" +
    "<div class='tag-info'>\n" +
    "<input class='title' ng-disabled='true' ng-model='tag.title'>\n" +
    "<div class='count' ng-show='tag.content.isAllTag'>{{tag.cachedNoteCount}}</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='tags-title-section section-title-bar'>\n" +
    "<div class='section-title-bar-header'>\n" +
    "<div class='sk-h3 title'>\n" +
    "<span class='sk-bold'>Tags</span>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='tag' ng-class='{&#39;selected&#39; : ctrl.selectedTag == tag}' ng-click='ctrl.selectTag(tag)' ng-repeat='tag in ctrl.tags track by tag.uuid'>\n" +
    "<div class='tag-info'>\n" +
    "<div class='tag-icon'>#</div>\n" +
    "<input class='title' ng-attr-id='tag-{{tag.uuid}}' ng-blur='ctrl.saveTag($event, tag)' ng-change='ctrl.tagTitleDidChange(tag)' ng-class='{&#39;editing&#39; : ctrl.editingTag == tag}' ng-click='ctrl.selectTag(tag)' ng-keyup='$event.keyCode == 13 &amp;&amp; $event.target.blur()' ng-model='tag.title' should-focus='ctrl.newTag || ctrl.editingTag == tag' sn-autofocus='true' spellcheck='false'>\n" +
    "<div class='count'>{{tag.cachedNoteCount}}</div>\n" +
    "</div>\n" +
    "<div class='danger small-text bold' ng-show='tag.content.conflict_of'>Conflicted Copy</div>\n" +
    "<div class='danger small-text bold' ng-show='tag.errorDecrypting'>Missing Keys</div>\n" +
    "<div class='menu' ng-show='ctrl.selectedTag == tag'>\n" +
    "<a class='item' ng-click='ctrl.selectedRenameTag($event, tag)' ng-show='!ctrl.editingTag'>Rename</a>\n" +
    "<a class='item' ng-click='ctrl.saveTag($event, tag)' ng-show='ctrl.editingTag'>Save</a>\n" +
    "<a class='item' ng-click='ctrl.selectedDeleteTag(tag)'>Delete</a>\n" +
    "</div>\n" +
    "</div>\n" +
    "<div class='no-tags-placeholder' ng-show='ctrl.tags.length == 0'>\n" +
    "No tags. Create one using the add button above.\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "</div>\n" +
    "<panel-resizer collapsable='true' control='ctrl.panelController' default-width='150' hoverable='true' on-resize-finish='ctrl.onPanelResize' panel-id='&#39;tags-column&#39;'></panel-resizer>\n" +
    "</div>\n"
  );

}]);
