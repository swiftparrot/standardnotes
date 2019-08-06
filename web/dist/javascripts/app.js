"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SNTheme = exports.SNSmartTag = exports.SNServerExtension = exports.SNMfa = exports.SNEncryptedStorage = exports.SNTag = exports.SNNote = exports.SNExtension = exports.Action = exports.SNEditor = exports.SNComponent = exports.SNComponentManager = undefined;

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _standardFileJs = require("standard-file-js");

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SNComponentManager = exports.SNComponentManager = function () {

  /*
    @param {string} environment: one of [web, desktop, mobile]
    @param {string} platform: one of [ios, android, linux-${environment}, mac-${environment}, windows-${environment}]
  */
  function SNComponentManager(_ref) {
    var modelManager = _ref.modelManager,
        syncManager = _ref.syncManager,
        desktopManager = _ref.desktopManager,
        nativeExtManager = _ref.nativeExtManager,
        alertManager = _ref.alertManager,
        $uiRunner = _ref.$uiRunner,
        $timeout = _ref.$timeout,
        environment = _ref.environment,
        platform = _ref.platform;

    _classCallCheck(this, SNComponentManager);

    /* This domain will be used to save context item client data */
    SNComponentManager.ClientDataDomain = "org.standardnotes.sn.components";

    // Some actions need to be run on the ui thread (desktop/web only)
    this.$uiRunner = $uiRunner || function (fn) {
      fn();
    };
    this.$timeout = $timeout || setTimeout.bind(window);

    this.modelManager = modelManager;
    this.syncManager = syncManager;
    this.desktopManager = desktopManager;
    this.nativeExtManager = nativeExtManager;
    this.alertManager = alertManager;

    this.streamObservers = [];
    this.contextStreamObservers = [];
    this.activeComponents = [];

    this.environment = environment;
    this.platform = platform;
    this.isDesktop = this.environment == "desktop";
    this.isMobile = this.environment == "mobile";

    if (environment != "mobile") {
      this.configureForNonMobileUsage();
    }

    this.configureForGeneralUsage();

    // this.loggingEnabled = true;

    this.permissionDialogs = [];

    this.handlers = [];
  }

  _createClass(SNComponentManager, [{
    key: "configureForGeneralUsage",
    value: function configureForGeneralUsage() {
      var _this = this;

      this.modelManager.addItemSyncObserver("component-manager", "*", function (allItems, validItems, deletedItems, source, sourceKey) {
        var syncedComponents = allItems.filter(function (item) {
          return item.content_type === "SN|Component" || item.content_type == "SN|Theme";
        });

        /* We only want to sync if the item source is Retrieved, not MappingSourceRemoteSaved to avoid
          recursion caused by the component being modified and saved after it is updated.
        */
        if (syncedComponents.length > 0 && source != SFModelManager.MappingSourceRemoteSaved) {
          // Ensure any component in our data is installed by the system
          if (_this.isDesktop) {
            _this.desktopManager.syncComponentsInstallation(syncedComponents);
          }
        }

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = syncedComponents[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var component = _step.value;

            var activeComponent = _.find(_this.activeComponents, { uuid: component.uuid });
            if (component.active && !component.deleted && !activeComponent) {
              _this.activateComponent(component);
            } else if (!component.active && activeComponent) {
              _this.deactivateComponent(component);
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        var _loop = function _loop(observer) {
          if (sourceKey && sourceKey == observer.component.uuid) {
            // Don't notify source of change, as it is the originator, doesn't need duplicate event.
            return "continue";
          }

          var relevantItems = allItems.filter(function (item) {
            return observer.contentTypes.indexOf(item.content_type) !== -1;
          });

          if (relevantItems.length == 0) {
            return "continue";
          }

          var requiredPermissions = [{
            name: "stream-items",
            content_types: observer.contentTypes.sort()
          }];

          _this.runWithPermissions(observer.component, requiredPermissions, function () {
            _this.sendItemsInReply(observer.component, relevantItems, observer.originalMessage);
          });
        };

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = _this.streamObservers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var observer = _step2.value;

            var _ret = _loop(observer);

            if (_ret === "continue") continue;
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        var requiredContextPermissions = [{
          name: "stream-context-item"
        }];

        var _loop2 = function _loop2(observer) {
          if (sourceKey && sourceKey == observer.component.uuid) {
            // Don't notify source of change, as it is the originator, doesn't need duplicate event.
            return "continue";
          }

          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = _this.handlers[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var handler = _step4.value;

              if (!handler.areas.includes(observer.component.area) && !handler.areas.includes("*")) {
                continue;
              }
              if (handler.contextRequestHandler) {
                itemInContext = handler.contextRequestHandler(observer.component);

                if (itemInContext) {
                  matchingItem = _.find(allItems, { uuid: itemInContext.uuid });

                  if (matchingItem) {
                    _this.runWithPermissions(observer.component, requiredContextPermissions, function () {
                      _this.sendContextItemInReply(observer.component, matchingItem, observer.originalMessage, source);
                    });
                  }
                }
              }
            }
          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
              }
            }
          }
        };

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = _this.contextStreamObservers[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var observer = _step3.value;
            var itemInContext;
            var matchingItem;

            var _ret2 = _loop2(observer);

            if (_ret2 === "continue") continue;
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      });
    }
  }, {
    key: "configureForNonMobileUsage",
    value: function configureForNonMobileUsage() {
      var _this2 = this;

      var detectFocusChange = function detectFocusChange(event) {
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = _this2.activeComponents[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var component = _step5.value;

            if (document.activeElement == _this2.iframeForComponent(component)) {
              _this2.$timeout(function () {
                _this2.focusChangedForComponent(component);
              });
              break;
            }
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
              _iterator5.return();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }
      };

      window.addEventListener ? window.addEventListener('focus', detectFocusChange, true) : window.attachEvent('onfocusout', detectFocusChange);
      window.addEventListener ? window.addEventListener('blur', detectFocusChange, true) : window.attachEvent('onblur', detectFocusChange);

      this.desktopManager.registerUpdateObserver(function (component) {
        // Reload theme if active
        if (component.active && component.isTheme()) {
          _this2.postActiveThemesToAllComponents();
        }
      });

      // On mobile, events listeners are handled by a respective component
      window.addEventListener("message", function (event) {
        if (_this2.loggingEnabled) {
          console.log("Web app: received message", event);
        }

        // Make sure this message is for us
        if (event.data.sessionKey) {
          _this2.handleMessage(_this2.componentForSessionKey(event.data.sessionKey), event.data);
        }
      }, false);
    }
  }, {
    key: "postActiveThemesToAllComponents",
    value: function postActiveThemesToAllComponents() {
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = this.components[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var component = _step6.value;

          // Skip over components that are themes themselves,
          // or components that are not active, or components that don't have a window
          if (component.isTheme() || !component.active || !component.window) {
            continue;
          }

          this.postActiveThemesToComponent(component);
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }
    }
  }, {
    key: "getActiveThemes",
    value: function getActiveThemes() {
      return this.componentsForArea("themes").filter(function (theme) {
        return theme.active;
      });
    }
  }, {
    key: "urlsForActiveThemes",
    value: function urlsForActiveThemes() {
      var _this3 = this;

      var themes = this.getActiveThemes();
      return themes.map(function (theme) {
        return _this3.urlForComponent(theme);
      });
    }
  }, {
    key: "postActiveThemesToComponent",
    value: function postActiveThemesToComponent(component) {
      var urls = this.urlsForActiveThemes();
      var data = { themes: urls };

      this.sendMessageToComponent(component, { action: "themes", data: data });
    }
  }, {
    key: "contextItemDidChangeInArea",
    value: function contextItemDidChangeInArea(area) {
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = this.handlers[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var handler = _step7.value;

          if (handler.areas.includes(area) === false && !handler.areas.includes("*")) {
            continue;
          }
          var observers = this.contextStreamObservers.filter(function (observer) {
            return observer.component.area === area;
          });

          var _iteratorNormalCompletion8 = true;
          var _didIteratorError8 = false;
          var _iteratorError8 = undefined;

          try {
            for (var _iterator8 = observers[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
              var observer = _step8.value;

              if (handler.contextRequestHandler) {
                var itemInContext = handler.contextRequestHandler(observer.component);
                if (itemInContext) {
                  this.sendContextItemInReply(observer.component, itemInContext, observer.originalMessage);
                }
              }
            }
          } catch (err) {
            _didIteratorError8 = true;
            _iteratorError8 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion8 && _iterator8.return) {
                _iterator8.return();
              }
            } finally {
              if (_didIteratorError8) {
                throw _iteratorError8;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7.return) {
            _iterator7.return();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }
    }
  }, {
    key: "setComponentHidden",
    value: function setComponentHidden(component, hidden) {
      /*
        A hidden component will not receive messages.
        However, when a component is unhidden, we need to send it any items it may have
        registered streaming for.
      */
      if (hidden) {
        component.hidden = true;
      } else if (component.hidden) {
        // Only enter this condition if component is hidden to make this note have double side effects.
        component.hidden = false;

        // streamContextItem
        var contextObserver = _.find(this.contextStreamObservers, { identifier: component.uuid });
        if (contextObserver) {
          this.handleStreamContextItemMessage(component, contextObserver.originalMessage);
        }

        // streamItems
        var streamObserver = _.find(this.streamObservers, { identifier: component.uuid });
        if (streamObserver) {
          this.handleStreamItemsMessage(component, streamObserver.originalMessage);
        }
      }
    }
  }, {
    key: "jsonForItem",
    value: function jsonForItem(item, component, source) {
      var params = { uuid: item.uuid, content_type: item.content_type, created_at: item.created_at, updated_at: item.updated_at, deleted: item.deleted };
      params.content = item.createContentJSONFromProperties();
      params.clientData = item.getDomainDataItem(component.getClientDataKey(), SNComponentManager.ClientDataDomain) || {};

      // isMetadataUpdate implies that the extension should make reference of updated metadata,
      // but not update content values as they may be stale relative to what the extension currently has
      // Changes are always metadata updates if the mapping source is SFModelManager.MappingSourceRemoteSaved || source == SFModelManager.MappingSourceLocalSaved.
      //
      if (source && (source == SFModelManager.MappingSourceRemoteSaved || source == SFModelManager.MappingSourceLocalSaved)) {
        params.isMetadataUpdate = true;
      }

      this.removePrivatePropertiesFromResponseItems([params], component, { type: "outgoing" });
      return params;
    }
  }, {
    key: "sendItemsInReply",
    value: function sendItemsInReply(component, items, message, source) {
      var _this4 = this;

      if (this.loggingEnabled) {
        console.log("Web|componentManager|sendItemsInReply", component, items, message);
      };
      var response = { items: {} };
      var mapped = items.map(function (item) {
        return _this4.jsonForItem(item, component, source);
      });

      response.items = mapped;
      this.replyToMessage(component, message, response);
    }
  }, {
    key: "sendContextItemInReply",
    value: function sendContextItemInReply(component, item, originalMessage, source) {
      if (this.loggingEnabled) {
        console.log("Web|componentManager|sendContextItemInReply", component, item, originalMessage);
      };
      var response = { item: this.jsonForItem(item, component, source) };
      this.replyToMessage(component, originalMessage, response);
    }
  }, {
    key: "replyToMessage",
    value: function replyToMessage(component, originalMessage, replyData) {
      var reply = {
        action: "reply",
        original: originalMessage,
        data: replyData
      };

      this.sendMessageToComponent(component, reply);
    }
  }, {
    key: "sendMessageToComponent",
    value: function sendMessageToComponent(component, message) {
      var permissibleActionsWhileHidden = ["component-registered", "themes"];
      if (component.hidden && !permissibleActionsWhileHidden.includes(message.action)) {
        if (this.loggingEnabled) {
          console.log("Component disabled for current item, not sending any messages.", component.name);
        }
        return;
      }

      if (this.loggingEnabled) {
        console.log("Web|sendMessageToComponent", component, message);
      }

      var origin = this.urlForComponent(component, "file://");
      if (!origin.startsWith("http") && !origin.startsWith("file")) {
        // Native extension running in web, prefix current host
        origin = window.location.href + origin;
      }

      if (!component.window) {
        this.alertManager.alert({ text: "Standard Notes is trying to communicate with " + component.name + ", but an error is occurring. Please restart this extension and try again." });
      }

      // Mobile messaging requires json
      if (this.isMobile) {
        message = JSON.stringify(message);
      }

      component.window.postMessage(message, origin);
    }
  }, {
    key: "componentsForArea",
    value: function componentsForArea(area) {
      return this.components.filter(function (component) {
        return component.area === area;
      });
    }
  }, {
    key: "urlForComponent",
    value: function urlForComponent(component) {
      var offlinePrefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

      // offlineOnly is available only on desktop, and not on web or mobile.
      if (component.offlineOnly && !this.isDesktop) {
        return null;
      }

      if (component.offlineOnly || this.isDesktop && component.local_url) {
        return component.local_url && component.local_url.replace("sn://", offlinePrefix + this.desktopManager.getApplicationDataPath() + "/");
      } else {
        var url = component.hosted_url || component.legacy_url;
        if (this.isMobile) {
          var localReplacement = this.platform == "ios" ? "localhost" : "10.0.2.2";
          url = url.replace("localhost", localReplacement).replace("sn.local", localReplacement);
        }
        return url;
      }
    }
  }, {
    key: "componentForUrl",
    value: function componentForUrl(url) {
      return this.components.filter(function (component) {
        return component.hosted_url === url || component.legacy_url === url;
      })[0];
    }
  }, {
    key: "componentForSessionKey",
    value: function componentForSessionKey(key) {
      var component = _.find(this.components, { sessionKey: key });
      if (!component) {
        var _iteratorNormalCompletion9 = true;
        var _didIteratorError9 = false;
        var _iteratorError9 = undefined;

        try {
          for (var _iterator9 = this.handlers[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
            var handler = _step9.value;

            if (handler.componentForSessionKeyHandler) {
              component = handler.componentForSessionKeyHandler(key);
              if (component) {
                break;
              }
            }
          }
        } catch (err) {
          _didIteratorError9 = true;
          _iteratorError9 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion9 && _iterator9.return) {
              _iterator9.return();
            }
          } finally {
            if (_didIteratorError9) {
              throw _iteratorError9;
            }
          }
        }
      }
      return component;
    }
  }, {
    key: "handleMessage",
    value: function handleMessage(component, message) {
      var _this5 = this;

      if (!component) {
        console.log("Component not defined for message, returning", message);
        this.alertManager.alert({ text: "An extension is trying to communicate with Standard Notes, but there is an error establishing a bridge. Please restart the app and try again." });
        return;
      }

      // Actions that won't succeeed with readonly mode
      var readwriteActions = ["save-items", "associate-item", "deassociate-item", "create-item", "create-items", "delete-items", "set-component-data"];

      if (component.readonly && readwriteActions.includes(message.action)) {
        // A component can be marked readonly if changes should not be saved.
        // Particullary used for revision preview windows where the notes should not be savable.
        this.alertManager.alert({ text: "The extension " + component.name + " is trying to save, but it is in a locked state and cannot accept changes." });
        return;
      }

      /**
      Possible Messages:
        set-size
        stream-items
        stream-context-item
        save-items
        select-item
        associate-item
        deassociate-item
        clear-selection
        create-item
        create-items
        delete-items
        set-component-data
        install-local-component
        toggle-activate-component
        request-permissions
        present-conflict-resolution
      */

      if (message.action === "stream-items") {
        this.handleStreamItemsMessage(component, message);
      } else if (message.action === "stream-context-item") {
        this.handleStreamContextItemMessage(component, message);
      } else if (message.action === "set-component-data") {
        this.handleSetComponentDataMessage(component, message);
      } else if (message.action === "delete-items") {
        this.handleDeleteItemsMessage(component, message);
      } else if (message.action === "create-items" || message.action === "create-item") {
        this.handleCreateItemsMessage(component, message);
      } else if (message.action === "save-items") {
        this.handleSaveItemsMessage(component, message);
      } else if (message.action === "toggle-activate-component") {
        var componentToToggle = this.modelManager.findItem(message.data.uuid);
        this.handleToggleComponentMessage(component, componentToToggle, message);
      } else if (message.action === "request-permissions") {
        this.handleRequestPermissionsMessage(component, message);
      } else if (message.action === "install-local-component") {
        this.handleInstallLocalComponentMessage(component, message);
      } else if (message.action === "duplicate-item") {
        this.handleDuplicateItemMessage(component, message);
      }

      // Notify observers

      var _loop3 = function _loop3(handler) {
        if (handler.actionHandler && (handler.areas.includes(component.area) || handler.areas.includes("*"))) {
          _this5.$timeout(function () {
            handler.actionHandler(component, message.action, message.data);
          });
        }
      };

      var _iteratorNormalCompletion10 = true;
      var _didIteratorError10 = false;
      var _iteratorError10 = undefined;

      try {
        for (var _iterator10 = this.handlers[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
          var handler = _step10.value;

          _loop3(handler);
        }
      } catch (err) {
        _didIteratorError10 = true;
        _iteratorError10 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion10 && _iterator10.return) {
            _iterator10.return();
          }
        } finally {
          if (_didIteratorError10) {
            throw _iteratorError10;
          }
        }
      }
    }
  }, {
    key: "removePrivatePropertiesFromResponseItems",
    value: function removePrivatePropertiesFromResponseItems(responseItems, component) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      // can be 'incoming' or 'outgoing'. We want to remove updated_at if incoming, but keep it if outgoing
      if (options.type == "incoming") {
        var privateTopLevelProperties = ["updated_at"];
        // Maintaining our own updated_at value is imperative for sync to work properly, we ignore any incoming value.
        var _iteratorNormalCompletion11 = true;
        var _didIteratorError11 = false;
        var _iteratorError11 = undefined;

        try {
          for (var _iterator11 = responseItems[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
            var responseItem = _step11.value;

            if (typeof responseItem.setDirty === 'function') {
              console.error("Attempting to pass object. Use JSON.");
              continue;
            }
            var _iteratorNormalCompletion12 = true;
            var _didIteratorError12 = false;
            var _iteratorError12 = undefined;

            try {
              for (var _iterator12 = privateTopLevelProperties[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                var privateProperty = _step12.value;

                delete responseItem[privateProperty];
              }
            } catch (err) {
              _didIteratorError12 = true;
              _iteratorError12 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion12 && _iterator12.return) {
                  _iterator12.return();
                }
              } finally {
                if (_didIteratorError12) {
                  throw _iteratorError12;
                }
              }
            }
          }
        } catch (err) {
          _didIteratorError11 = true;
          _iteratorError11 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion11 && _iterator11.return) {
              _iterator11.return();
            }
          } finally {
            if (_didIteratorError11) {
              throw _iteratorError11;
            }
          }
        }
      }

      if (component) {
        // System extensions can bypass this step
        if (this.nativeExtManager && this.nativeExtManager.isSystemExtension(component)) {
          return;
        }
      }
      // Don't allow component to overwrite these properties.
      var privateContentProperties = ["autoupdateDisabled", "permissions", "active"];
      if (options) {
        if (options.includeUrls) {
          privateContentProperties = privateContentProperties.concat(["url", "hosted_url", "local_url"]);
        }
      }
      var _iteratorNormalCompletion13 = true;
      var _didIteratorError13 = false;
      var _iteratorError13 = undefined;

      try {
        for (var _iterator13 = responseItems[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
          var _responseItem = _step13.value;

          // Do not pass in actual items here, otherwise that would be destructive.
          // Instead, generic JS/JSON objects should be passed.
          if (typeof _responseItem.setDirty === 'function') {
            console.error("Attempting to pass object. Use JSON.");
            continue;
          }

          var _iteratorNormalCompletion14 = true;
          var _didIteratorError14 = false;
          var _iteratorError14 = undefined;

          try {
            for (var _iterator14 = privateContentProperties[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
              var prop = _step14.value;

              delete _responseItem.content[prop];
            }
          } catch (err) {
            _didIteratorError14 = true;
            _iteratorError14 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion14 && _iterator14.return) {
                _iterator14.return();
              }
            } finally {
              if (_didIteratorError14) {
                throw _iteratorError14;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError13 = true;
        _iteratorError13 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion13 && _iterator13.return) {
            _iterator13.return();
          }
        } finally {
          if (_didIteratorError13) {
            throw _iteratorError13;
          }
        }
      }
    }
  }, {
    key: "handleStreamItemsMessage",
    value: function handleStreamItemsMessage(component, message) {
      var _this6 = this;

      var requiredPermissions = [{
        name: "stream-items",
        content_types: message.data.content_types.sort()
      }];

      this.runWithPermissions(component, requiredPermissions, function () {
        if (!_.find(_this6.streamObservers, { identifier: component.uuid })) {
          // for pushing laster as changes come in
          _this6.streamObservers.push({
            identifier: component.uuid,
            component: component,
            originalMessage: message,
            contentTypes: message.data.content_types
          });
        }

        // push immediately now
        var items = [];
        var _iteratorNormalCompletion15 = true;
        var _didIteratorError15 = false;
        var _iteratorError15 = undefined;

        try {
          for (var _iterator15 = message.data.content_types[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
            var contentType = _step15.value;

            items = items.concat(_this6.modelManager.validItemsForContentType(contentType));
          }
        } catch (err) {
          _didIteratorError15 = true;
          _iteratorError15 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion15 && _iterator15.return) {
              _iterator15.return();
            }
          } finally {
            if (_didIteratorError15) {
              throw _iteratorError15;
            }
          }
        }

        _this6.sendItemsInReply(component, items, message);
      });
    }
  }, {
    key: "handleStreamContextItemMessage",
    value: function handleStreamContextItemMessage(component, message) {
      var _this7 = this;

      var requiredPermissions = [{
        name: "stream-context-item"
      }];

      this.runWithPermissions(component, requiredPermissions, function () {
        if (!_.find(_this7.contextStreamObservers, { identifier: component.uuid })) {
          // for pushing laster as changes come in
          _this7.contextStreamObservers.push({
            identifier: component.uuid,
            component: component,
            originalMessage: message
          });
        }

        // push immediately now
        var _iteratorNormalCompletion16 = true;
        var _didIteratorError16 = false;
        var _iteratorError16 = undefined;

        try {
          for (var _iterator16 = _this7.handlersForArea(component.area)[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
            var handler = _step16.value;

            if (handler.contextRequestHandler) {
              var itemInContext = handler.contextRequestHandler(component);
              if (itemInContext) {
                _this7.sendContextItemInReply(component, itemInContext, message);
              }
            }
          }
        } catch (err) {
          _didIteratorError16 = true;
          _iteratorError16 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion16 && _iterator16.return) {
              _iterator16.return();
            }
          } finally {
            if (_didIteratorError16) {
              throw _iteratorError16;
            }
          }
        }
      });
    }
  }, {
    key: "isItemIdWithinComponentContextJurisdiction",
    value: function isItemIdWithinComponentContextJurisdiction(uuid, component) {
      var itemIdsInJurisdiction = this.itemIdsInContextJurisdictionForComponent(component);
      return itemIdsInJurisdiction.includes(uuid);
    }

    /* Returns items that given component has context permissions for */

  }, {
    key: "itemIdsInContextJurisdictionForComponent",
    value: function itemIdsInContextJurisdictionForComponent(component) {
      var itemIds = [];
      var _iteratorNormalCompletion17 = true;
      var _didIteratorError17 = false;
      var _iteratorError17 = undefined;

      try {
        for (var _iterator17 = this.handlersForArea(component.area)[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
          var handler = _step17.value;

          if (handler.contextRequestHandler) {
            var itemInContext = handler.contextRequestHandler(component);
            if (itemInContext) {
              itemIds.push(itemInContext.uuid);
            }
          }
        }
      } catch (err) {
        _didIteratorError17 = true;
        _iteratorError17 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion17 && _iterator17.return) {
            _iterator17.return();
          }
        } finally {
          if (_didIteratorError17) {
            throw _iteratorError17;
          }
        }
      }

      return itemIds;
    }
  }, {
    key: "handlersForArea",
    value: function handlersForArea(area) {
      return this.handlers.filter(function (candidate) {
        return candidate.areas.includes(area);
      });
    }
  }, {
    key: "handleSaveItemsMessage",
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(component, message) {
        var _this8 = this;

        var responseItems, requiredPermissions, itemIdsInContextJurisdiction, pendingResponseItems, _iteratorNormalCompletion18, _didIteratorError18, _iteratorError18, _iterator18, _step18, responseItem, requiredContentTypes;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                responseItems = message.data.items;
                requiredPermissions = [];
                itemIdsInContextJurisdiction = this.itemIdsInContextJurisdictionForComponent(component);

                // Pending as in needed to be accounted for in permissions.

                pendingResponseItems = responseItems.slice();
                _iteratorNormalCompletion18 = true;
                _didIteratorError18 = false;
                _iteratorError18 = undefined;
                _context2.prev = 7;
                _iterator18 = responseItems.slice()[Symbol.iterator]();

              case 9:
                if (_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done) {
                  _context2.next = 18;
                  break;
                }

                responseItem = _step18.value;

                if (!itemIdsInContextJurisdiction.includes(responseItem.uuid)) {
                  _context2.next = 15;
                  break;
                }

                requiredPermissions.push({
                  name: "stream-context-item"
                });
                _.pull(pendingResponseItems, responseItem);
                // We break because there can only be one context item
                return _context2.abrupt("break", 18);

              case 15:
                _iteratorNormalCompletion18 = true;
                _context2.next = 9;
                break;

              case 18:
                _context2.next = 24;
                break;

              case 20:
                _context2.prev = 20;
                _context2.t0 = _context2["catch"](7);
                _didIteratorError18 = true;
                _iteratorError18 = _context2.t0;

              case 24:
                _context2.prev = 24;
                _context2.prev = 25;

                if (!_iteratorNormalCompletion18 && _iterator18.return) {
                  _iterator18.return();
                }

              case 27:
                _context2.prev = 27;

                if (!_didIteratorError18) {
                  _context2.next = 30;
                  break;
                }

                throw _iteratorError18;

              case 30:
                return _context2.finish(27);

              case 31:
                return _context2.finish(24);

              case 32:

                // Check to see if additional privileges are required
                if (pendingResponseItems.length > 0) {
                  requiredContentTypes = _.uniq(pendingResponseItems.map(function (i) {
                    return i.content_type;
                  })).sort();

                  requiredPermissions.push({
                    name: "stream-items",
                    content_types: requiredContentTypes
                  });
                }

                this.runWithPermissions(component, requiredPermissions, _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                  var ids, items, lockedCount, _iteratorNormalCompletion19, _didIteratorError19, _iteratorError19, _iterator19, _step19, item, itemNoun, auxVerb, localItems, _iteratorNormalCompletion20, _didIteratorError20, _iteratorError20, _iterator20, _step20, _responseItem2, _item;

                  return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:

                          _this8.removePrivatePropertiesFromResponseItems(responseItems, component, { includeUrls: true, type: "incoming" });

                          /*
                          We map the items here because modelManager is what updates the UI. If you were to instead get the items directly,
                          this would update them server side via sync, but would never make its way back to the UI.
                          */

                          // Filter locked items
                          ids = responseItems.map(function (i) {
                            return i.uuid;
                          });
                          items = _this8.modelManager.findItems(ids);
                          lockedCount = 0;
                          _iteratorNormalCompletion19 = true;
                          _didIteratorError19 = false;
                          _iteratorError19 = undefined;
                          _context.prev = 7;

                          for (_iterator19 = items[Symbol.iterator](); !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
                            item = _step19.value;

                            if (item.locked) {
                              _.remove(responseItems, { uuid: item.uuid });
                              lockedCount++;
                            }
                          }

                          _context.next = 15;
                          break;

                        case 11:
                          _context.prev = 11;
                          _context.t0 = _context["catch"](7);
                          _didIteratorError19 = true;
                          _iteratorError19 = _context.t0;

                        case 15:
                          _context.prev = 15;
                          _context.prev = 16;

                          if (!_iteratorNormalCompletion19 && _iterator19.return) {
                            _iterator19.return();
                          }

                        case 18:
                          _context.prev = 18;

                          if (!_didIteratorError19) {
                            _context.next = 21;
                            break;
                          }

                          throw _iteratorError19;

                        case 21:
                          return _context.finish(18);

                        case 22:
                          return _context.finish(15);

                        case 23:
                          if (lockedCount > 0) {
                            itemNoun = lockedCount == 1 ? "item" : "items";
                            auxVerb = lockedCount == 1 ? "is" : "are";

                            _this8.alertManager.alert({ title: 'Items Locked', text: lockedCount + " " + itemNoun + " you are attempting to save " + auxVerb + " locked and cannot be edited." });
                          }

                          _context.next = 26;
                          return _this8.modelManager.mapResponseItemsToLocalModels(responseItems, SFModelManager.MappingSourceComponentRetrieved, component.uuid);

                        case 26:
                          localItems = _context.sent;
                          _iteratorNormalCompletion20 = true;
                          _didIteratorError20 = false;
                          _iteratorError20 = undefined;
                          _context.prev = 30;
                          _iterator20 = responseItems[Symbol.iterator]();

                        case 32:
                          if (_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done) {
                            _context.next = 42;
                            break;
                          }

                          _responseItem2 = _step20.value;
                          _item = _.find(localItems, { uuid: _responseItem2.uuid });

                          if (_item) {
                            _context.next = 38;
                            break;
                          }

                          // An item this extension is trying to save was possibly removed locally, notify user
                          _this8.alertManager.alert({ text: "The extension " + component.name + " is trying to save an item with type " + _responseItem2.content_type + ", but that item does not exist. Please restart this extension and try again." });
                          return _context.abrupt("continue", 39);

                        case 38:

                          if (!_item.locked) {
                            if (_responseItem2.clientData) {
                              _item.setDomainDataItem(component.getClientDataKey(), _responseItem2.clientData, SNComponentManager.ClientDataDomain);
                            }
                            _this8.modelManager.setItemDirty(_item, true, true, SFModelManager.MappingSourceComponentRetrieved, component.uuid);
                          }

                        case 39:
                          _iteratorNormalCompletion20 = true;
                          _context.next = 32;
                          break;

                        case 42:
                          _context.next = 48;
                          break;

                        case 44:
                          _context.prev = 44;
                          _context.t1 = _context["catch"](30);
                          _didIteratorError20 = true;
                          _iteratorError20 = _context.t1;

                        case 48:
                          _context.prev = 48;
                          _context.prev = 49;

                          if (!_iteratorNormalCompletion20 && _iterator20.return) {
                            _iterator20.return();
                          }

                        case 51:
                          _context.prev = 51;

                          if (!_didIteratorError20) {
                            _context.next = 54;
                            break;
                          }

                          throw _iteratorError20;

                        case 54:
                          return _context.finish(51);

                        case 55:
                          return _context.finish(48);

                        case 56:

                          _this8.syncManager.sync().then(function (response) {
                            // Allow handlers to be notified when a save begins and ends, to update the UI
                            var saveMessage = Object.assign({}, message);
                            saveMessage.action = response && response.error ? "save-error" : "save-success";
                            _this8.replyToMessage(component, message, { error: response && response.error });
                            _this8.handleMessage(component, saveMessage);
                          });

                        case 57:
                        case "end":
                          return _context.stop();
                      }
                    }
                  }, _callee, _this8, [[7, 11, 15, 23], [16,, 18, 22], [30, 44, 48, 56], [49,, 51, 55]]);
                })));

              case 34:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[7, 20, 24, 32], [25,, 27, 31]]);
      }));

      function handleSaveItemsMessage(_x3, _x4) {
        return _ref2.apply(this, arguments);
      }

      return handleSaveItemsMessage;
    }()
  }, {
    key: "handleDuplicateItemMessage",
    value: function handleDuplicateItemMessage(component, message) {
      var _this9 = this;

      var itemParams = message.data.item;
      var item = this.modelManager.findItem(itemParams.uuid);
      var requiredPermissions = [{
        name: "stream-items",
        content_types: [item.content_type]
      }];

      this.runWithPermissions(component, requiredPermissions, function () {
        var duplicate = _this9.modelManager.duplicateItemAndAdd(item);
        _this9.syncManager.sync();

        _this9.replyToMessage(component, message, { item: _this9.jsonForItem(duplicate, component) });
      });
    }
  }, {
    key: "handleCreateItemsMessage",
    value: function handleCreateItemsMessage(component, message) {
      var _this10 = this;

      var responseItems = message.data.item ? [message.data.item] : message.data.items;
      var uniqueContentTypes = _.uniq(responseItems.map(function (item) {
        return item.content_type;
      }));
      var requiredPermissions = [{
        name: "stream-items",
        content_types: uniqueContentTypes
      }];

      this.runWithPermissions(component, requiredPermissions, function () {
        _this10.removePrivatePropertiesFromResponseItems(responseItems, component, { type: "incoming" });
        var processedItems = [];
        var _iteratorNormalCompletion21 = true;
        var _didIteratorError21 = false;
        var _iteratorError21 = undefined;

        try {
          for (var _iterator21 = responseItems[Symbol.iterator](), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
            var responseItem = _step21.value;

            var item = _this10.modelManager.createItem(responseItem);
            if (responseItem.clientData) {
              item.setDomainDataItem(component.getClientDataKey(), responseItem.clientData, SNComponentManager.ClientDataDomain);
            }
            _this10.modelManager.addItem(item);
            _this10.modelManager.resolveReferencesForItem(item, true);
            _this10.modelManager.setItemDirty(item, true);
            processedItems.push(item);
          }
        } catch (err) {
          _didIteratorError21 = true;
          _iteratorError21 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion21 && _iterator21.return) {
              _iterator21.return();
            }
          } finally {
            if (_didIteratorError21) {
              throw _iteratorError21;
            }
          }
        }

        _this10.syncManager.sync();

        // "create-item" or "create-items" are possible messages handled here
        var reply = message.action == "create-item" ? { item: _this10.jsonForItem(processedItems[0], component) } : { items: processedItems.map(function (item) {
            return _this10.jsonForItem(item, component);
          }) };

        _this10.replyToMessage(component, message, reply);
      });
    }
  }, {
    key: "handleDeleteItemsMessage",
    value: function handleDeleteItemsMessage(component, message) {
      var _this11 = this;

      var requiredContentTypes = _.uniq(message.data.items.map(function (i) {
        return i.content_type;
      })).sort();
      var requiredPermissions = [{
        name: "stream-items",
        content_types: requiredContentTypes
      }];

      this.runWithPermissions(component, requiredPermissions, _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var itemsData, noun, reply, didConfirm, _iteratorNormalCompletion22, _didIteratorError22, _iteratorError22, _iterator22, _step22, itemData, model;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                itemsData = message.data.items;
                noun = itemsData.length == 1 ? "item" : "items";
                reply = null;
                didConfirm = true;
                _context3.next = 6;
                return _this11.alertManager.confirm({ text: "Are you sure you want to delete " + itemsData.length + " " + noun + "?" }).catch(function () {
                  didConfirm = false;
                });

              case 6:
                if (!didConfirm) {
                  _context3.next = 42;
                  break;
                }

                // Filter for any components and deactivate before deleting
                _iteratorNormalCompletion22 = true;
                _didIteratorError22 = false;
                _iteratorError22 = undefined;
                _context3.prev = 10;
                _iterator22 = itemsData[Symbol.iterator]();

              case 12:
                if (_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done) {
                  _context3.next = 24;
                  break;
                }

                itemData = _step22.value;
                model = _this11.modelManager.findItem(itemData.uuid);

                if (model) {
                  _context3.next = 18;
                  break;
                }

                _this11.alertManager.alert({ text: "The item you are trying to delete cannot be found." });
                return _context3.abrupt("continue", 21);

              case 18:
                if (["SN|Component", "SN|Theme"].includes(model.content_type)) {
                  _this11.deactivateComponent(model, true);
                }
                _this11.modelManager.setItemToBeDeleted(model);
                // Currently extensions are not notified of association until a full server sync completes.
                // We manually notify observers.
                _this11.modelManager.notifySyncObserversOfModels([model], SFModelManager.MappingSourceRemoteSaved);

              case 21:
                _iteratorNormalCompletion22 = true;
                _context3.next = 12;
                break;

              case 24:
                _context3.next = 30;
                break;

              case 26:
                _context3.prev = 26;
                _context3.t0 = _context3["catch"](10);
                _didIteratorError22 = true;
                _iteratorError22 = _context3.t0;

              case 30:
                _context3.prev = 30;
                _context3.prev = 31;

                if (!_iteratorNormalCompletion22 && _iterator22.return) {
                  _iterator22.return();
                }

              case 33:
                _context3.prev = 33;

                if (!_didIteratorError22) {
                  _context3.next = 36;
                  break;
                }

                throw _iteratorError22;

              case 36:
                return _context3.finish(33);

              case 37:
                return _context3.finish(30);

              case 38:

                _this11.syncManager.sync();
                reply = { deleted: true };
                _context3.next = 43;
                break;

              case 42:
                // Rejected by user
                reply = { deleted: false };

              case 43:

                _this11.replyToMessage(component, message, reply);

              case 44:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, _this11, [[10, 26, 30, 38], [31,, 33, 37]]);
      })));
    }
  }, {
    key: "handleRequestPermissionsMessage",
    value: function handleRequestPermissionsMessage(component, message) {
      var _this12 = this;

      this.runWithPermissions(component, message.data.permissions, function () {
        _this12.replyToMessage(component, message, { approved: true });
      });
    }
  }, {
    key: "handleSetComponentDataMessage",
    value: function handleSetComponentDataMessage(component, message) {
      var _this13 = this;

      // A component setting its own data does not require special permissions
      this.runWithPermissions(component, [], function () {
        component.componentData = message.data.componentData;
        _this13.modelManager.setItemDirty(component, true);
        _this13.syncManager.sync();
      });
    }
  }, {
    key: "handleToggleComponentMessage",
    value: function handleToggleComponentMessage(sourceComponent, targetComponent, message) {
      this.toggleComponent(targetComponent);
    }
  }, {
    key: "toggleComponent",
    value: function toggleComponent(component) {
      var _this14 = this;

      if (component.area == "modal") {
        this.openModalComponent(component);
      } else {
        if (component.active) {
          this.deactivateComponent(component);
        } else {
          if (component.content_type == "SN|Theme") {
            // Deactive currently active theme if new theme is not layerable
            var activeThemes = this.getActiveThemes();

            // Activate current before deactivating others, so as not to flicker
            this.activateComponent(component);

            if (!component.isLayerable()) {
              setTimeout(function () {
                var _iteratorNormalCompletion23 = true;
                var _didIteratorError23 = false;
                var _iteratorError23 = undefined;

                try {
                  for (var _iterator23 = activeThemes[Symbol.iterator](), _step23; !(_iteratorNormalCompletion23 = (_step23 = _iterator23.next()).done); _iteratorNormalCompletion23 = true) {
                    var theme = _step23.value;

                    if (theme && !theme.isLayerable()) {
                      _this14.deactivateComponent(theme);
                    }
                  }
                } catch (err) {
                  _didIteratorError23 = true;
                  _iteratorError23 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion23 && _iterator23.return) {
                      _iterator23.return();
                    }
                  } finally {
                    if (_didIteratorError23) {
                      throw _iteratorError23;
                    }
                  }
                }
              }, 10);
            }
          } else {
            this.activateComponent(component);
          }
        }
      }
    }
  }, {
    key: "handleInstallLocalComponentMessage",
    value: function handleInstallLocalComponentMessage(sourceComponent, message) {
      // Only extensions manager has this permission
      if (this.nativeExtManager && !this.nativeExtManager.isSystemExtension(sourceComponent)) {
        return;
      }

      var targetComponent = this.modelManager.findItem(message.data.uuid);
      this.desktopManager.installComponent(targetComponent);
    }
  }, {
    key: "runWithPermissions",
    value: function runWithPermissions(component, requiredPermissions, runFunction) {
      if (!component.permissions) {
        component.permissions = [];
      }

      // Make copy as not to mutate input values
      requiredPermissions = JSON.parse(JSON.stringify(requiredPermissions));

      var acquiredPermissions = component.permissions;

      var _loop4 = function _loop4(required) {
        // Remove anything we already have
        var respectiveAcquired = acquiredPermissions.find(function (candidate) {
          return candidate.name == required.name;
        });
        if (!respectiveAcquired) {
          return "continue";
        }

        // We now match on name, lets substract from required.content_types anything we have in acquired.
        var requiredContentTypes = required.content_types;

        if (!requiredContentTypes) {
          // If this permission does not require any content types (i.e stream-context-item)
          // then we can remove this from required since we match by name (respectiveAcquired.name == required.name)
          _.pull(requiredPermissions, required);
          return "continue";
        }

        var _iteratorNormalCompletion25 = true;
        var _didIteratorError25 = false;
        var _iteratorError25 = undefined;

        try {
          for (var _iterator25 = respectiveAcquired.content_types[Symbol.iterator](), _step25; !(_iteratorNormalCompletion25 = (_step25 = _iterator25.next()).done); _iteratorNormalCompletion25 = true) {
            var acquiredContentType = _step25.value;

            // console.log("Removing content_type", acquiredContentType, "from", requiredContentTypes);
            _.pull(requiredContentTypes, acquiredContentType);
          }
        } catch (err) {
          _didIteratorError25 = true;
          _iteratorError25 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion25 && _iterator25.return) {
              _iterator25.return();
            }
          } finally {
            if (_didIteratorError25) {
              throw _iteratorError25;
            }
          }
        }

        if (requiredContentTypes.length == 0) {
          // We've removed all acquired and end up with zero, means we already have all these permissions
          _.pull(requiredPermissions, required);
        }
      };

      var _iteratorNormalCompletion24 = true;
      var _didIteratorError24 = false;
      var _iteratorError24 = undefined;

      try {
        for (var _iterator24 = requiredPermissions.slice()[Symbol.iterator](), _step24; !(_iteratorNormalCompletion24 = (_step24 = _iterator24.next()).done); _iteratorNormalCompletion24 = true) {
          var required = _step24.value;

          var _ret4 = _loop4(required);

          if (_ret4 === "continue") continue;
        }
      } catch (err) {
        _didIteratorError24 = true;
        _iteratorError24 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion24 && _iterator24.return) {
            _iterator24.return();
          }
        } finally {
          if (_didIteratorError24) {
            throw _iteratorError24;
          }
        }
      }

      if (requiredPermissions.length > 0) {
        this.promptForPermissions(component, requiredPermissions, function (approved) {
          if (approved) {
            runFunction();
          }
        });
      } else {
        runFunction();
      }
    }
  }, {
    key: "promptForPermissions",
    value: function promptForPermissions(component, permissions, callback) {
      var _this15 = this;

      var params = {};
      params.component = component;
      params.permissions = permissions;
      params.permissionsString = this.permissionsStringForPermissions(permissions, component);
      params.actionBlock = callback;

      params.callback = function (approved) {
        if (approved) {
          var _loop5 = function _loop5(permission) {
            var matchingPermission = component.permissions.find(function (candidate) {
              return candidate.name == permission.name;
            });
            if (!matchingPermission) {
              component.permissions.push(permission);
            } else {
              // Permission already exists, but content_types may have been expanded
              var contentTypes = matchingPermission.content_types || [];
              matchingPermission.content_types = _.uniq(contentTypes.concat(permission.content_types));
            }
          };

          var _iteratorNormalCompletion26 = true;
          var _didIteratorError26 = false;
          var _iteratorError26 = undefined;

          try {
            for (var _iterator26 = permissions[Symbol.iterator](), _step26; !(_iteratorNormalCompletion26 = (_step26 = _iterator26.next()).done); _iteratorNormalCompletion26 = true) {
              var permission = _step26.value;

              _loop5(permission);
            }
          } catch (err) {
            _didIteratorError26 = true;
            _iteratorError26 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion26 && _iterator26.return) {
                _iterator26.return();
              }
            } finally {
              if (_didIteratorError26) {
                throw _iteratorError26;
              }
            }
          }

          _this15.modelManager.setItemDirty(component, true);
          _this15.syncManager.sync();
        }

        _this15.permissionDialogs = _this15.permissionDialogs.filter(function (pendingDialog) {
          // Remove self
          if (pendingDialog == params) {
            pendingDialog.actionBlock && pendingDialog.actionBlock(approved);
            return false;
          }

          var containsObjectSubset = function containsObjectSubset(source, target) {
            return !target.some(function (val) {
              return !source.find(function (candidate) {
                return JSON.stringify(candidate) === JSON.stringify(val);
              });
            });
          };

          if (pendingDialog.component == component) {
            // remove pending dialogs that are encapsulated by already approved permissions, and run its function
            if (pendingDialog.permissions == permissions || containsObjectSubset(permissions, pendingDialog.permissions)) {
              // If approved, run the action block. Otherwise, if canceled, cancel any pending ones as well, since the user was
              // explicit in their intentions
              if (approved) {
                pendingDialog.actionBlock && pendingDialog.actionBlock(approved);
              }
              return false;
            }
          }
          return true;
        });

        if (_this15.permissionDialogs.length > 0) {
          _this15.presentPermissionsDialog(_this15.permissionDialogs[0]);
        }
      };

      // since these calls are asyncronous, multiple dialogs may be requested at the same time. We only want to present one and trigger all callbacks based on one modal result
      var existingDialog = _.find(this.permissionDialogs, { component: component });

      this.permissionDialogs.push(params);

      if (!existingDialog) {
        this.presentPermissionsDialog(params);
      } else {
        console.log("Existing dialog, not presenting.");
      }
    }
  }, {
    key: "presentPermissionsDialog",
    value: function presentPermissionsDialog(dialog) {
      console.error("Must override");
    }
  }, {
    key: "openModalComponent",
    value: function openModalComponent(component) {
      console.error("Must override");
    }
  }, {
    key: "registerHandler",
    value: function registerHandler(handler) {
      this.handlers.push(handler);
    }
  }, {
    key: "deregisterHandler",
    value: function deregisterHandler(identifier) {
      var handler = _.find(this.handlers, { identifier: identifier });
      if (!handler) {
        console.log("Attempting to deregister non-existing handler");
        return;
      }
      this.handlers.splice(this.handlers.indexOf(handler), 1);
    }

    // Called by other views when the iframe is ready

  }, {
    key: "registerComponentWindow",
    value: function () {
      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(component, componentWindow) {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (component.window === componentWindow) {
                  if (this.loggingEnabled) {
                    console.log("Web|componentManager", "attempting to re-register same component window.");
                  }
                }

                if (this.loggingEnabled) {
                  console.log("Web|componentManager|registerComponentWindow", component);
                }
                component.window = componentWindow;
                _context4.next = 5;
                return SFJS.crypto.generateUUID();

              case 5:
                component.sessionKey = _context4.sent;

                this.sendMessageToComponent(component, {
                  action: "component-registered",
                  sessionKey: component.sessionKey,
                  componentData: component.componentData,
                  data: {
                    uuid: component.uuid,
                    environment: this.environment,
                    platform: this.platform,
                    activeThemeUrls: this.urlsForActiveThemes()
                  }
                });

                this.postActiveThemesToComponent(component);

                if (this.desktopManager) {
                  this.desktopManager.notifyComponentActivation(component);
                }

              case 9:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function registerComponentWindow(_x5, _x6) {
        return _ref5.apply(this, arguments);
      }

      return registerComponentWindow;
    }()
  }, {
    key: "activateComponent",
    value: function activateComponent(component) {
      var _this16 = this;

      var dontSync = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var didChange = component.active != true;

      component.active = true;

      var _loop6 = function _loop6(handler) {
        if (handler.areas.includes(component.area) || handler.areas.includes("*")) {
          // We want to run the handler in a $timeout so the UI updates, but we also don't want it to run asyncronously
          // so that the steps below this one are run before the handler. So we run in a waitTimeout.
          // Update 12/18: We were using this.waitTimeout previously, however, that caused the iframe.onload callback to never be called
          // for some reason for iframes on desktop inside the revision-preview-modal. So we'll use safeApply instead. I'm not quite sure
          // where the original "so the UI updates" comment applies to, but we'll have to keep an eye out to see if this causes problems somewhere else.
          _this16.$uiRunner(function () {
            handler.activationHandler && handler.activationHandler(component);
          });
        }
      };

      var _iteratorNormalCompletion27 = true;
      var _didIteratorError27 = false;
      var _iteratorError27 = undefined;

      try {
        for (var _iterator27 = this.handlers[Symbol.iterator](), _step27; !(_iteratorNormalCompletion27 = (_step27 = _iterator27.next()).done); _iteratorNormalCompletion27 = true) {
          var handler = _step27.value;

          _loop6(handler);
        }
      } catch (err) {
        _didIteratorError27 = true;
        _iteratorError27 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion27 && _iterator27.return) {
            _iterator27.return();
          }
        } finally {
          if (_didIteratorError27) {
            throw _iteratorError27;
          }
        }
      }

      if (didChange && !dontSync) {
        this.modelManager.setItemDirty(component, true);
        this.syncManager.sync();
      }

      if (!this.activeComponents.includes(component)) {
        this.activeComponents.push(component);
      }

      if (component.area == "themes") {
        this.postActiveThemesToAllComponents();
      }
    }
  }, {
    key: "deactivateComponent",
    value: function deactivateComponent(component) {
      var _this17 = this;

      var dontSync = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var didChange = component.active != false;
      component.active = false;
      component.sessionKey = null;

      var _loop7 = function _loop7(handler) {
        if (handler.areas.includes(component.area) || handler.areas.includes("*")) {
          // See comment in activateComponent regarding safeApply and awaitTimeout
          _this17.$uiRunner(function () {
            handler.activationHandler && handler.activationHandler(component);
          });
        }
      };

      var _iteratorNormalCompletion28 = true;
      var _didIteratorError28 = false;
      var _iteratorError28 = undefined;

      try {
        for (var _iterator28 = this.handlers[Symbol.iterator](), _step28; !(_iteratorNormalCompletion28 = (_step28 = _iterator28.next()).done); _iteratorNormalCompletion28 = true) {
          var handler = _step28.value;

          _loop7(handler);
        }
      } catch (err) {
        _didIteratorError28 = true;
        _iteratorError28 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion28 && _iterator28.return) {
            _iterator28.return();
          }
        } finally {
          if (_didIteratorError28) {
            throw _iteratorError28;
          }
        }
      }

      if (didChange && !dontSync) {
        this.modelManager.setItemDirty(component, true);
        this.syncManager.sync();
      }

      _.pull(this.activeComponents, component);

      this.streamObservers = this.streamObservers.filter(function (o) {
        return o.component !== component;
      });

      this.contextStreamObservers = this.contextStreamObservers.filter(function (o) {
        return o.component !== component;
      });

      if (component.area == "themes") {
        this.postActiveThemesToAllComponents();
      }
    }
  }, {
    key: "reloadComponent",
    value: function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(component) {
        var _this18 = this;

        var _loop8, _iteratorNormalCompletion29, _didIteratorError29, _iteratorError29, _iterator29, _step29, handler;

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                //
                // Do soft deactivate
                //
                component.active = false;

                _loop8 = function _loop8(handler) {
                  if (handler.areas.includes(component.area) || handler.areas.includes("*")) {
                    // See comment in activateComponent regarding safeApply and awaitTimeout
                    _this18.$uiRunner(function () {
                      handler.activationHandler && handler.activationHandler(component);
                    });
                  }
                };

                _iteratorNormalCompletion29 = true;
                _didIteratorError29 = false;
                _iteratorError29 = undefined;
                _context5.prev = 5;
                for (_iterator29 = this.handlers[Symbol.iterator](); !(_iteratorNormalCompletion29 = (_step29 = _iterator29.next()).done); _iteratorNormalCompletion29 = true) {
                  handler = _step29.value;

                  _loop8(handler);
                }

                _context5.next = 13;
                break;

              case 9:
                _context5.prev = 9;
                _context5.t0 = _context5["catch"](5);
                _didIteratorError29 = true;
                _iteratorError29 = _context5.t0;

              case 13:
                _context5.prev = 13;
                _context5.prev = 14;

                if (!_iteratorNormalCompletion29 && _iterator29.return) {
                  _iterator29.return();
                }

              case 16:
                _context5.prev = 16;

                if (!_didIteratorError29) {
                  _context5.next = 19;
                  break;
                }

                throw _iteratorError29;

              case 19:
                return _context5.finish(16);

              case 20:
                return _context5.finish(13);

              case 21:
                this.streamObservers = this.streamObservers.filter(function (o) {
                  return o.component !== component;
                });

                this.contextStreamObservers = this.contextStreamObservers.filter(function (o) {
                  return o.component !== component;
                });

                if (component.area == "themes") {
                  this.postActiveThemesToAllComponents();
                }

                //
                // Do soft activate
                //

                return _context5.abrupt("return", new Promise(function (resolve, reject) {
                  _this18.$timeout(function () {
                    component.active = true;
                    var _iteratorNormalCompletion30 = true;
                    var _didIteratorError30 = false;
                    var _iteratorError30 = undefined;

                    try {
                      for (var _iterator30 = _this18.handlers[Symbol.iterator](), _step30; !(_iteratorNormalCompletion30 = (_step30 = _iterator30.next()).done); _iteratorNormalCompletion30 = true) {
                        var handler = _step30.value;

                        if (handler.areas.includes(component.area) || handler.areas.includes("*")) {
                          // See comment in activateComponent regarding safeApply and awaitTimeout
                          _this18.$uiRunner(function () {
                            handler.activationHandler && handler.activationHandler(component);
                            resolve();
                          });
                        }
                      }
                    } catch (err) {
                      _didIteratorError30 = true;
                      _iteratorError30 = err;
                    } finally {
                      try {
                        if (!_iteratorNormalCompletion30 && _iterator30.return) {
                          _iterator30.return();
                        }
                      } finally {
                        if (_didIteratorError30) {
                          throw _iteratorError30;
                        }
                      }
                    }

                    if (!_this18.activeComponents.includes(component)) {
                      _this18.activeComponents.push(component);
                    }

                    if (component.area == "themes") {
                      _this18.postActiveThemesToAllComponents();
                    }
                    // Resolve again in case first resolve in for loop isn't reached.
                    // Should be no effect if resolved twice, only first will be used.
                    resolve();
                  });
                }));

              case 25:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this, [[5, 9, 13, 21], [14,, 16, 20]]);
      }));

      function reloadComponent(_x9) {
        return _ref6.apply(this, arguments);
      }

      return reloadComponent;
    }()
  }, {
    key: "deleteComponent",
    value: function deleteComponent(component) {
      this.modelManager.setItemToBeDeleted(component);
      this.syncManager.sync();
    }
  }, {
    key: "isComponentActive",
    value: function isComponentActive(component) {
      return component.active;
    }
  }, {
    key: "iframeForComponent",
    value: function iframeForComponent(component) {
      var _iteratorNormalCompletion31 = true;
      var _didIteratorError31 = false;
      var _iteratorError31 = undefined;

      try {
        for (var _iterator31 = Array.from(document.getElementsByTagName("iframe"))[Symbol.iterator](), _step31; !(_iteratorNormalCompletion31 = (_step31 = _iterator31.next()).done); _iteratorNormalCompletion31 = true) {
          var frame = _step31.value;

          var componentId = frame.dataset.componentId;
          if (componentId === component.uuid) {
            return frame;
          }
        }
      } catch (err) {
        _didIteratorError31 = true;
        _iteratorError31 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion31 && _iterator31.return) {
            _iterator31.return();
          }
        } finally {
          if (_didIteratorError31) {
            throw _iteratorError31;
          }
        }
      }
    }
  }, {
    key: "focusChangedForComponent",
    value: function focusChangedForComponent(component) {
      var focused = document.activeElement == this.iframeForComponent(component);
      var _iteratorNormalCompletion32 = true;
      var _didIteratorError32 = false;
      var _iteratorError32 = undefined;

      try {
        for (var _iterator32 = this.handlers[Symbol.iterator](), _step32; !(_iteratorNormalCompletion32 = (_step32 = _iterator32.next()).done); _iteratorNormalCompletion32 = true) {
          var handler = _step32.value;

          // Notify all handlers, and not just ones that match this component type
          handler.focusHandler && handler.focusHandler(component, focused);
        }
      } catch (err) {
        _didIteratorError32 = true;
        _iteratorError32 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion32 && _iterator32.return) {
            _iterator32.return();
          }
        } finally {
          if (_didIteratorError32) {
            throw _iteratorError32;
          }
        }
      }
    }
  }, {
    key: "handleSetSizeEvent",
    value: function handleSetSizeEvent(component, data) {
      var setSize = function setSize(element, size) {
        var widthString = typeof size.width === 'string' ? size.width : data.width + "px";
        var heightString = typeof size.height === 'string' ? size.height : data.height + "px";
        if (element) {
          element.setAttribute("style", "width:" + widthString + "; height:" + heightString + ";");
        }
      };

      if (component.area == "rooms" || component.area == "modal") {
        var selector = component.area == "rooms" ? "inner" : "outer";
        var content = document.getElementById("component-content-" + selector + "-" + component.uuid);
        if (content) {
          setSize(content, data);
        }
      } else {
        var iframe = this.iframeForComponent(component);
        if (!iframe) {
          return;
        }

        setSize(iframe, data);

        // On Firefox, resizing a component iframe does not seem to have an effect with editor-stack extensions.
        // Sizing the parent does the trick, however, we can't do this globally, otherwise, areas like the note-tags will
        // not be able to expand outside of the bounds (to display autocomplete, for example).
        if (component.area == "editor-stack") {
          var parent = iframe.parentElement;
          if (parent) {
            setSize(parent, data);
          }
        }

        // content object in this case is === to the iframe object above. This is probably
        // legacy code from when we would size content and container individually, which we no longer do.
        // var content = document.getElementById(`component-iframe-${component.uuid}`);
        // console.log("content === iframe", content == iframe);
        // if(content) {
        //   setSize(content, data);
        // }
      }
    }
  }, {
    key: "editorForNote",
    value: function editorForNote(note) {
      var editors = this.componentsForArea("editor-editor");
      var _iteratorNormalCompletion33 = true;
      var _didIteratorError33 = false;
      var _iteratorError33 = undefined;

      try {
        for (var _iterator33 = editors[Symbol.iterator](), _step33; !(_iteratorNormalCompletion33 = (_step33 = _iterator33.next()).done); _iteratorNormalCompletion33 = true) {
          var editor = _step33.value;

          if (editor.isExplicitlyEnabledForItem(note)) {
            return editor;
          }
        }

        // No editor found for note. Use default editor, if note does not prefer system editor
      } catch (err) {
        _didIteratorError33 = true;
        _iteratorError33 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion33 && _iterator33.return) {
            _iterator33.return();
          }
        } finally {
          if (_didIteratorError33) {
            throw _iteratorError33;
          }
        }
      }

      if (this.isMobile) {
        if (!note.content.mobilePrefersPlainEditor) {
          return this.getDefaultEditor();
        }
      } else {
        if (!note.getAppDataItem("prefersPlainEditor")) {
          return editors.filter(function (e) {
            return e.isDefaultEditor();
          })[0];
        }
      }
    }
  }, {
    key: "permissionsStringForPermissions",
    value: function permissionsStringForPermissions(permissions, component) {
      var _this19 = this;

      var finalString = "";
      var permissionsCount = permissions.length;

      var addSeparator = function addSeparator(index, length) {
        if (index > 0) {
          if (index == length - 1) {
            if (length == 2) {
              return " and ";
            } else {
              return ", and ";
            }
          } else {
            return ", ";
          }
        }

        return "";
      };

      permissions.forEach(function (permission, index) {
        if (permission.name === "stream-items") {
          var types = permission.content_types.map(function (type) {
            var desc = _this19.modelManager.humanReadableDisplayForContentType(type);
            if (desc) {
              return desc + "s";
            } else {
              return "items of type " + type;
            }
          });
          var typesString = "";

          for (var i = 0; i < types.length; i++) {
            var type = types[i];
            typesString += addSeparator(i, types.length + permissionsCount - index - 1);
            typesString += type;
          }

          finalString += addSeparator(index, permissionsCount);

          finalString += typesString;

          if (types.length >= 2 && index < permissionsCount - 1) {
            // If you have a list of types, and still an additional root-level permission coming up, add a comma
            finalString += ", ";
          }
        } else if (permission.name === "stream-context-item") {
          var mapping = {
            "editor-stack": "working note",
            "note-tags": "working note",
            "editor-editor": "working note"
          };

          finalString += addSeparator(index, permissionsCount, true);

          finalString += mapping[component.area];
        }
      });

      return finalString + ".";
    }
  }, {
    key: "components",
    get: function get() {
      return this.modelManager.allItemsMatchingTypes(["SN|Component", "SN|Theme"]);
    }
  }]);

  return SNComponentManager;
}();

;
var SNComponent = exports.SNComponent = function (_SFItem) {
  _inherits(SNComponent, _SFItem);

  function SNComponent(json_obj) {
    _classCallCheck(this, SNComponent);

    // If making a copy of an existing component (usually during sign in if you have a component active in the session),
    // which may have window set, you may get a cross-origin exception since you'll be trying to copy the window. So we clear it here.
    json_obj.window = null;

    var _this20 = _possibleConstructorReturn(this, (SNComponent.__proto__ || Object.getPrototypeOf(SNComponent)).call(this, json_obj));

    if (!_this20.componentData) {
      _this20.componentData = {};
    }

    if (!_this20.disassociatedItemIds) {
      _this20.disassociatedItemIds = [];
    }

    if (!_this20.associatedItemIds) {
      _this20.associatedItemIds = [];
    }
    return _this20;
  }

  _createClass(SNComponent, [{
    key: "mapContentToLocalProperties",
    value: function mapContentToLocalProperties(content) {
      _get(SNComponent.prototype.__proto__ || Object.getPrototypeOf(SNComponent.prototype), "mapContentToLocalProperties", this).call(this, content);
      /* Legacy */
      // We don't want to set the url directly, as we'd like to phase it out.
      // If the content.url exists, we'll transfer it to legacy_url
      // We'll only need to set this if content.hosted_url is blank, otherwise, hosted_url is the url replacement.
      if (!content.hosted_url) {
        this.legacy_url = content.url;
      }

      /* New */
      this.local_url = content.local_url;
      this.hosted_url = content.hosted_url || content.url;
      this.offlineOnly = content.offlineOnly;

      if (content.valid_until) {
        this.valid_until = new Date(content.valid_until);
      }

      this.name = content.name;
      this.autoupdateDisabled = content.autoupdateDisabled;

      this.package_info = content.package_info;

      // the location in the view this component is located in. Valid values are currently tags-list, note-tags, and editor-stack`
      this.area = content.area;

      this.permissions = content.permissions;
      if (!this.permissions) {
        this.permissions = [];
      }

      this.active = content.active;

      // custom data that a component can store in itself
      this.componentData = content.componentData || {};

      // items that have requested a component to be disabled in its context
      this.disassociatedItemIds = content.disassociatedItemIds || [];

      // items that have requested a component to be enabled in its context
      this.associatedItemIds = content.associatedItemIds || [];
    }
  }, {
    key: "handleDeletedContent",
    value: function handleDeletedContent() {
      _get(SNComponent.prototype.__proto__ || Object.getPrototypeOf(SNComponent.prototype), "handleDeletedContent", this).call(this);

      this.active = false;
    }
  }, {
    key: "structureParams",
    value: function structureParams() {
      var params = {
        legacy_url: this.legacy_url,
        hosted_url: this.hosted_url,
        local_url: this.local_url,
        valid_until: this.valid_until,
        offlineOnly: this.offlineOnly,
        name: this.name,
        area: this.area,
        package_info: this.package_info,
        permissions: this.permissions,
        active: this.active,
        autoupdateDisabled: this.autoupdateDisabled,
        componentData: this.componentData,
        disassociatedItemIds: this.disassociatedItemIds,
        associatedItemIds: this.associatedItemIds
      };

      var superParams = _get(SNComponent.prototype.__proto__ || Object.getPrototypeOf(SNComponent.prototype), "structureParams", this).call(this);
      Object.assign(superParams, params);
      return superParams;
    }
  }, {
    key: "isEditor",
    value: function isEditor() {
      return this.area == "editor-editor";
    }
  }, {
    key: "isTheme",
    value: function isTheme() {
      return this.content_type == "SN|Theme" || this.area == "themes";
    }
  }, {
    key: "isDefaultEditor",
    value: function isDefaultEditor() {
      return this.getAppDataItem("defaultEditor") == true;
    }
  }, {
    key: "setLastSize",
    value: function setLastSize(size) {
      this.setAppDataItem("lastSize", size);
    }
  }, {
    key: "getLastSize",
    value: function getLastSize() {
      return this.getAppDataItem("lastSize");
    }
  }, {
    key: "acceptsThemes",
    value: function acceptsThemes() {
      if (this.content.package_info && "acceptsThemes" in this.content.package_info) {
        return this.content.package_info.acceptsThemes;
      }
      return true;
    }

    /*
      The key used to look up data that this component may have saved to an item.
      This key will be look up on the item, and not on itself.
     */

  }, {
    key: "getClientDataKey",
    value: function getClientDataKey() {
      if (this.legacy_url) {
        return this.legacy_url;
      } else {
        return this.uuid;
      }
    }
  }, {
    key: "hasValidHostedUrl",
    value: function hasValidHostedUrl() {
      return this.hosted_url || this.legacy_url;
    }
  }, {
    key: "keysToIgnoreWhenCheckingContentEquality",
    value: function keysToIgnoreWhenCheckingContentEquality() {
      return ["active", "disassociatedItemIds", "associatedItemIds"].concat(_get(SNComponent.prototype.__proto__ || Object.getPrototypeOf(SNComponent.prototype), "keysToIgnoreWhenCheckingContentEquality", this).call(this));
    }

    /*
      An associative component depends on being explicitly activated for a given item, compared to a dissaciative component,
      which is enabled by default in areas unrelated to a certain item.
     */

  }, {
    key: "isAssociative",
    value: function isAssociative() {
      return Component.associativeAreas().includes(this.area);
    }
  }, {
    key: "associateWithItem",
    value: function associateWithItem(item) {
      this.associatedItemIds.push(item.uuid);
    }
  }, {
    key: "isExplicitlyEnabledForItem",
    value: function isExplicitlyEnabledForItem(item) {
      return this.associatedItemIds.indexOf(item.uuid) !== -1;
    }
  }, {
    key: "isExplicitlyDisabledForItem",
    value: function isExplicitlyDisabledForItem(item) {
      return this.disassociatedItemIds.indexOf(item.uuid) !== -1;
    }
  }, {
    key: "content_type",
    get: function get() {
      return "SN|Component";
    }
  }], [{
    key: "associativeAreas",
    value: function associativeAreas() {
      return ["editor-editor"];
    }
  }]);

  return SNComponent;
}(_standardFileJs.SFItem);

;
var SNEditor = exports.SNEditor = function (_SFItem2) {
  _inherits(SNEditor, _SFItem2);

  function SNEditor(json_obj) {
    _classCallCheck(this, SNEditor);

    var _this21 = _possibleConstructorReturn(this, (SNEditor.__proto__ || Object.getPrototypeOf(SNEditor)).call(this, json_obj));

    if (!_this21.notes) {
      _this21.notes = [];
    }
    if (!_this21.data) {
      _this21.data = {};
    }
    return _this21;
  }

  _createClass(SNEditor, [{
    key: "mapContentToLocalProperties",
    value: function mapContentToLocalProperties(content) {
      _get(SNEditor.prototype.__proto__ || Object.getPrototypeOf(SNEditor.prototype), "mapContentToLocalProperties", this).call(this, content);
      this.url = content.url;
      this.name = content.name;
      this.data = content.data || {};
      this.default = content.default;
      this.systemEditor = content.systemEditor;
    }
  }, {
    key: "structureParams",
    value: function structureParams() {
      var params = {
        url: this.url,
        name: this.name,
        data: this.data,
        default: this.default,
        systemEditor: this.systemEditor
      };

      var superParams = _get(SNEditor.prototype.__proto__ || Object.getPrototypeOf(SNEditor.prototype), "structureParams", this).call(this);
      Object.assign(superParams, params);
      return superParams;
    }
  }, {
    key: "referenceParams",
    value: function referenceParams() {
      var references = _.map(this.notes, function (note) {
        return { uuid: note.uuid, content_type: note.content_type };
      });

      return references;
    }
  }, {
    key: "addItemAsRelationship",
    value: function addItemAsRelationship(item) {
      if (item.content_type == "Note") {
        if (!_.find(this.notes, item)) {
          this.notes.push(item);
        }
      }
      _get(SNEditor.prototype.__proto__ || Object.getPrototypeOf(SNEditor.prototype), "addItemAsRelationship", this).call(this, item);
    }
  }, {
    key: "removeItemAsRelationship",
    value: function removeItemAsRelationship(item) {
      if (item.content_type == "Note") {
        _.pull(this.notes, item);
      }
      _get(SNEditor.prototype.__proto__ || Object.getPrototypeOf(SNEditor.prototype), "removeItemAsRelationship", this).call(this, item);
    }
  }, {
    key: "removeAndDirtyAllRelationships",
    value: function removeAndDirtyAllRelationships() {
      _get(SNEditor.prototype.__proto__ || Object.getPrototypeOf(SNEditor.prototype), "removeAndDirtyAllRelationships", this).call(this);
      this.notes = [];
    }
  }, {
    key: "removeReferencesNotPresentIn",
    value: function removeReferencesNotPresentIn(references) {
      _get(SNEditor.prototype.__proto__ || Object.getPrototypeOf(SNEditor.prototype), "removeReferencesNotPresentIn", this).call(this, references);

      var uuids = references.map(function (ref) {
        return ref.uuid;
      });
      this.notes.forEach(function (note) {
        if (!uuids.includes(note.uuid)) {
          _.remove(this.notes, { uuid: note.uuid });
        }
      }.bind(this));
    }
  }, {
    key: "potentialItemOfInterestHasChangedItsUUID",
    value: function potentialItemOfInterestHasChangedItsUUID(newItem, oldUUID, newUUID) {
      if (newItem.content_type === "Note" && _.find(this.notes, { uuid: oldUUID })) {
        _.remove(this.notes, { uuid: oldUUID });
        this.notes.push(newItem);
      }
    }
  }, {
    key: "setData",
    value: function setData(key, value) {
      var dataHasChanged = JSON.stringify(this.data[key]) !== JSON.stringify(value);
      if (dataHasChanged) {
        this.data[key] = value;
        return true;
      }
      return false;
    }
  }, {
    key: "dataForKey",
    value: function dataForKey(key) {
      return this.data[key] || {};
    }
  }, {
    key: "content_type",
    get: function get() {
      return "SN|Editor";
    }
  }]);

  return SNEditor;
}(_standardFileJs.SFItem);

;
var Action = exports.Action = function Action(json) {
  _classCallCheck(this, Action);

  _.merge(this, json);
  this.running = false; // in case running=true was synced with server since model is uploaded nondiscriminatory
  this.error = false;
  if (this.lastExecuted) {
    // is string
    this.lastExecuted = new Date(this.lastExecuted);
  }
};

var SNExtension = exports.SNExtension = function (_SFItem3) {
  _inherits(SNExtension, _SFItem3);

  function SNExtension(json) {
    _classCallCheck(this, SNExtension);

    var _this22 = _possibleConstructorReturn(this, (SNExtension.__proto__ || Object.getPrototypeOf(SNExtension)).call(this, json));

    if (json.actions) {
      _this22.actions = json.actions.map(function (action) {
        return new Action(action);
      });
    }

    if (!_this22.actions) {
      _this22.actions = [];
    }
    return _this22;
  }

  _createClass(SNExtension, [{
    key: "actionsWithContextForItem",
    value: function actionsWithContextForItem(item) {
      return this.actions.filter(function (action) {
        return action.context == item.content_type || action.context == "Item";
      });
    }
  }, {
    key: "mapContentToLocalProperties",
    value: function mapContentToLocalProperties(content) {
      _get(SNExtension.prototype.__proto__ || Object.getPrototypeOf(SNExtension.prototype), "mapContentToLocalProperties", this).call(this, content);
      this.description = content.description;
      this.url = content.url;
      this.name = content.name;
      this.package_info = content.package_info;
      this.supported_types = content.supported_types;
      if (content.actions) {
        this.actions = content.actions.map(function (action) {
          return new Action(action);
        });
      }
    }
  }, {
    key: "structureParams",
    value: function structureParams() {
      var params = {
        name: this.name,
        url: this.url,
        package_info: this.package_info,
        description: this.description,
        actions: this.actions.map(function (a) {
          return _.omit(a, ["subrows", "subactions"]);
        }),
        supported_types: this.supported_types
      };

      var superParams = _get(SNExtension.prototype.__proto__ || Object.getPrototypeOf(SNExtension.prototype), "structureParams", this).call(this);
      Object.assign(superParams, params);
      return superParams;
    }
  }, {
    key: "content_type",
    get: function get() {
      return "Extension";
    }
  }]);

  return SNExtension;
}(_standardFileJs.SFItem);

;
var SNNote = exports.SNNote = function (_SFItem4) {
  _inherits(SNNote, _SFItem4);

  function SNNote(json_obj) {
    _classCallCheck(this, SNNote);

    var _this23 = _possibleConstructorReturn(this, (SNNote.__proto__ || Object.getPrototypeOf(SNNote)).call(this, json_obj));

    if (!_this23.text) {
      // Some external editors can't handle a null value for text.
      // Notes created on mobile with no text have a null value for it,
      // so we'll just set a default here.
      _this23.text = "";
    }

    if (!_this23.tags) {
      _this23.tags = [];
    }
    return _this23;
  }

  _createClass(SNNote, [{
    key: "mapContentToLocalProperties",
    value: function mapContentToLocalProperties(content) {
      _get(SNNote.prototype.__proto__ || Object.getPrototypeOf(SNNote.prototype), "mapContentToLocalProperties", this).call(this, content);
      this.title = content.title;
      this.text = content.text;
    }
  }, {
    key: "structureParams",
    value: function structureParams() {
      var params = {
        title: this.title,
        text: this.text
      };

      var superParams = _get(SNNote.prototype.__proto__ || Object.getPrototypeOf(SNNote.prototype), "structureParams", this).call(this);
      Object.assign(superParams, params);
      return superParams;
    }
  }, {
    key: "addItemAsRelationship",
    value: function addItemAsRelationship(item) {
      /*
      Legacy.
      Previously, note/tag relationships were bidirectional, however in some cases there
      may be broken links such that a note has references to a tag and not vice versa.
      Now, only tags contain references to notes. For old notes that may have references to tags,
      we want to transfer them over to the tag.
       */
      if (item.content_type == "Tag") {
        item.addItemAsRelationship(this);
      }
      _get(SNNote.prototype.__proto__ || Object.getPrototypeOf(SNNote.prototype), "addItemAsRelationship", this).call(this, item);
    }
  }, {
    key: "setIsBeingReferencedBy",
    value: function setIsBeingReferencedBy(item) {
      _get(SNNote.prototype.__proto__ || Object.getPrototypeOf(SNNote.prototype), "setIsBeingReferencedBy", this).call(this, item);
      this.clearSavedTagsString();
    }
  }, {
    key: "setIsNoLongerBeingReferencedBy",
    value: function setIsNoLongerBeingReferencedBy(item) {
      _get(SNNote.prototype.__proto__ || Object.getPrototypeOf(SNNote.prototype), "setIsNoLongerBeingReferencedBy", this).call(this, item);
      this.clearSavedTagsString();
    }
  }, {
    key: "isBeingRemovedLocally",
    value: function isBeingRemovedLocally() {
      this.tags.forEach(function (tag) {
        _.remove(tag.notes, { uuid: this.uuid });
      }.bind(this));
      _get(SNNote.prototype.__proto__ || Object.getPrototypeOf(SNNote.prototype), "isBeingRemovedLocally", this).call(this);
    }
  }, {
    key: "informReferencesOfUUIDChange",
    value: function informReferencesOfUUIDChange(oldUUID, newUUID) {
      _get(SNNote.prototype.__proto__ || Object.getPrototypeOf(SNNote.prototype), "informReferencesOfUUIDChange", this).call(this);
      var _iteratorNormalCompletion34 = true;
      var _didIteratorError34 = false;
      var _iteratorError34 = undefined;

      try {
        for (var _iterator34 = this.tags[Symbol.iterator](), _step34; !(_iteratorNormalCompletion34 = (_step34 = _iterator34.next()).done); _iteratorNormalCompletion34 = true) {
          var tag = _step34.value;

          _.remove(tag.notes, { uuid: oldUUID });
          tag.notes.push(this);
        }
      } catch (err) {
        _didIteratorError34 = true;
        _iteratorError34 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion34 && _iterator34.return) {
            _iterator34.return();
          }
        } finally {
          if (_didIteratorError34) {
            throw _iteratorError34;
          }
        }
      }
    }
  }, {
    key: "tagDidFinishSyncing",
    value: function tagDidFinishSyncing(tag) {
      this.clearSavedTagsString();
    }
  }, {
    key: "safeText",
    value: function safeText() {
      return this.text || "";
    }
  }, {
    key: "safeTitle",
    value: function safeTitle() {
      return this.title || "";
    }
  }, {
    key: "clearSavedTagsString",
    value: function clearSavedTagsString() {
      this.savedTagsString = null;
    }
  }, {
    key: "tagsString",
    value: function tagsString() {
      this.savedTagsString = SNTag.arrayToDisplayString(this.tags);
      return this.savedTagsString;
    }
  }, {
    key: "content_type",
    get: function get() {
      return "Note";
    }
  }, {
    key: "displayName",
    get: function get() {
      return "Note";
    }
  }], [{
    key: "filterDummyNotes",
    value: function filterDummyNotes(notes) {
      var filtered = notes.filter(function (note) {
        return note.dummy == false || note.dummy == null;
      });
      return filtered;
    }
  }]);

  return SNNote;
}(_standardFileJs.SFItem);

;
var SNTag = exports.SNTag = function (_SFItem5) {
  _inherits(SNTag, _SFItem5);

  function SNTag(json_obj) {
    _classCallCheck(this, SNTag);

    var _this24 = _possibleConstructorReturn(this, (SNTag.__proto__ || Object.getPrototypeOf(SNTag)).call(this, json_obj));

    if (!_this24.content_type) {
      _this24.content_type = "Tag";
    }

    if (!_this24.notes) {
      _this24.notes = [];
    }
    return _this24;
  }

  _createClass(SNTag, [{
    key: "mapContentToLocalProperties",
    value: function mapContentToLocalProperties(content) {
      _get(SNTag.prototype.__proto__ || Object.getPrototypeOf(SNTag.prototype), "mapContentToLocalProperties", this).call(this, content);
      this.title = content.title;
    }
  }, {
    key: "structureParams",
    value: function structureParams() {
      var params = {
        title: this.title
      };

      var superParams = _get(SNTag.prototype.__proto__ || Object.getPrototypeOf(SNTag.prototype), "structureParams", this).call(this);
      Object.assign(superParams, params);
      return superParams;
    }
  }, {
    key: "addItemAsRelationship",
    value: function addItemAsRelationship(item) {
      if (item.content_type == "Note") {
        if (!_.find(this.notes, { uuid: item.uuid })) {
          this.notes.push(item);
          item.tags.push(this);
        }
      }
      _get(SNTag.prototype.__proto__ || Object.getPrototypeOf(SNTag.prototype), "addItemAsRelationship", this).call(this, item);
    }
  }, {
    key: "removeItemAsRelationship",
    value: function removeItemAsRelationship(item) {
      if (item.content_type == "Note") {
        _.remove(this.notes, { uuid: item.uuid });
        _.remove(item.tags, { uuid: this.uuid });
      }
      _get(SNTag.prototype.__proto__ || Object.getPrototypeOf(SNTag.prototype), "removeItemAsRelationship", this).call(this, item);
    }
  }, {
    key: "updateLocalRelationships",
    value: function updateLocalRelationships() {
      var references = this.content.references;

      var uuids = references.map(function (ref) {
        return ref.uuid;
      });
      this.notes.slice().forEach(function (note) {
        if (!uuids.includes(note.uuid)) {
          _.remove(note.tags, { uuid: this.uuid });
          _.remove(this.notes, { uuid: note.uuid });

          note.setIsNoLongerBeingReferencedBy(this);
        }
      }.bind(this));
    }
  }, {
    key: "isBeingRemovedLocally",
    value: function isBeingRemovedLocally() {
      var _this25 = this;

      this.notes.forEach(function (note) {
        _.remove(note.tags, { uuid: _this25.uuid });
        note.setIsNoLongerBeingReferencedBy(_this25);
      });

      this.notes.length = 0;

      _get(SNTag.prototype.__proto__ || Object.getPrototypeOf(SNTag.prototype), "isBeingRemovedLocally", this).call(this);
    }
  }, {
    key: "informReferencesOfUUIDChange",
    value: function informReferencesOfUUIDChange(oldUUID, newUUID) {
      var _iteratorNormalCompletion35 = true;
      var _didIteratorError35 = false;
      var _iteratorError35 = undefined;

      try {
        for (var _iterator35 = this.notes[Symbol.iterator](), _step35; !(_iteratorNormalCompletion35 = (_step35 = _iterator35.next()).done); _iteratorNormalCompletion35 = true) {
          var note = _step35.value;

          _.remove(note.tags, { uuid: oldUUID });
          note.tags.push(this);
        }
      } catch (err) {
        _didIteratorError35 = true;
        _iteratorError35 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion35 && _iterator35.return) {
            _iterator35.return();
          }
        } finally {
          if (_didIteratorError35) {
            throw _iteratorError35;
          }
        }
      }
    }
  }, {
    key: "didFinishSyncing",
    value: function didFinishSyncing() {
      var _iteratorNormalCompletion36 = true;
      var _didIteratorError36 = false;
      var _iteratorError36 = undefined;

      try {
        for (var _iterator36 = this.notes[Symbol.iterator](), _step36; !(_iteratorNormalCompletion36 = (_step36 = _iterator36.next()).done); _iteratorNormalCompletion36 = true) {
          var note = _step36.value;

          note.tagDidFinishSyncing(this);
        }
      } catch (err) {
        _didIteratorError36 = true;
        _iteratorError36 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion36 && _iterator36.return) {
            _iterator36.return();
          }
        } finally {
          if (_didIteratorError36) {
            throw _iteratorError36;
          }
        }
      }
    }
  }, {
    key: "isSmartTag",
    value: function isSmartTag() {
      return this.content_type == "SN|SmartTag";
    }
  }, {
    key: "displayName",
    get: function get() {
      return "Tag";
    }
  }], [{
    key: "arrayToDisplayString",
    value: function arrayToDisplayString(tags) {
      return tags.sort(function (a, b) {
        return a.title > b.title;
      }).map(function (tag, i) {
        return "#" + tag.title;
      }).join(" ");
    }
  }]);

  return SNTag;
}(_standardFileJs.SFItem);

;
var SNEncryptedStorage = exports.SNEncryptedStorage = function (_SFItem6) {
  _inherits(SNEncryptedStorage, _SFItem6);

  function SNEncryptedStorage() {
    _classCallCheck(this, SNEncryptedStorage);

    return _possibleConstructorReturn(this, (SNEncryptedStorage.__proto__ || Object.getPrototypeOf(SNEncryptedStorage)).apply(this, arguments));
  }

  _createClass(SNEncryptedStorage, [{
    key: "mapContentToLocalProperties",
    value: function mapContentToLocalProperties(content) {
      _get(SNEncryptedStorage.prototype.__proto__ || Object.getPrototypeOf(SNEncryptedStorage.prototype), "mapContentToLocalProperties", this).call(this, content);
      this.storage = content.storage;
    }
  }, {
    key: "content_type",
    get: function get() {
      return "SN|EncryptedStorage";
    }
  }]);

  return SNEncryptedStorage;
}(_standardFileJs.SFItem);

;
var SNMfa = exports.SNMfa = function (_SFItem7) {
  _inherits(SNMfa, _SFItem7);

  function SNMfa(json_obj) {
    _classCallCheck(this, SNMfa);

    return _possibleConstructorReturn(this, (SNMfa.__proto__ || Object.getPrototypeOf(SNMfa)).call(this, json_obj));
  }

  // mapContentToLocalProperties(content) {
  //   super.mapContentToLocalProperties(content)
  //   this.serverContent = content;
  // }
  //
  // structureParams() {
  //   return _.merge(this.serverContent, super.structureParams());
  // }

  _createClass(SNMfa, [{
    key: "doNotEncrypt",
    value: function doNotEncrypt() {
      return true;
    }
  }, {
    key: "content_type",
    get: function get() {
      return "SF|MFA";
    }
  }]);

  return SNMfa;
}(_standardFileJs.SFItem);

;
var SNServerExtension = exports.SNServerExtension = function (_SFItem8) {
  _inherits(SNServerExtension, _SFItem8);

  function SNServerExtension() {
    _classCallCheck(this, SNServerExtension);

    return _possibleConstructorReturn(this, (SNServerExtension.__proto__ || Object.getPrototypeOf(SNServerExtension)).apply(this, arguments));
  }

  _createClass(SNServerExtension, [{
    key: "mapContentToLocalProperties",
    value: function mapContentToLocalProperties(content) {
      _get(SNServerExtension.prototype.__proto__ || Object.getPrototypeOf(SNServerExtension.prototype), "mapContentToLocalProperties", this).call(this, content);
      this.url = content.url;
    }
  }, {
    key: "doNotEncrypt",
    value: function doNotEncrypt() {
      return true;
    }
  }, {
    key: "content_type",
    get: function get() {
      return "SF|Extension";
    }
  }]);

  return SNServerExtension;
}(_standardFileJs.SFItem);

;
var SNSmartTag = exports.SNSmartTag = function (_SNTag) {
  _inherits(SNSmartTag, _SNTag);

  function SNSmartTag(json_ob) {
    _classCallCheck(this, SNSmartTag);

    var _this29 = _possibleConstructorReturn(this, (SNSmartTag.__proto__ || Object.getPrototypeOf(SNSmartTag)).call(this, json_ob));

    _this29.content_type = "SN|SmartTag";
    return _this29;
  }

  _createClass(SNSmartTag, null, [{
    key: "systemSmartTags",
    value: function systemSmartTags() {
      return [new SNSmartTag({
        uuid: SNSmartTag.SystemSmartTagIdAllNotes,
        dummy: true,
        content: {
          title: "All notes",
          isSystemTag: true,
          isAllTag: true,
          predicate: new SFPredicate.fromArray(["content_type", "=", "Note"])
        }
      }), new SNSmartTag({
        uuid: SNSmartTag.SystemSmartTagIdArchivedNotes,
        dummy: true,
        content: {
          title: "Archived",
          isSystemTag: true,
          isArchiveTag: true,
          predicate: new SFPredicate.fromArray(["archived", "=", true])
        }
      }), new SNSmartTag({
        uuid: SNSmartTag.SystemSmartTagIdTrashedNotes,
        dummy: true,
        content: {
          title: "Trash",
          isSystemTag: true,
          isTrashTag: true,
          predicate: new SFPredicate.fromArray(["content.trashed", "=", true])
        }
      })];
    }
  }]);

  return SNSmartTag;
}(SNTag);

SNSmartTag.SystemSmartTagIdAllNotes = "all-notes";
SNSmartTag.SystemSmartTagIdArchivedNotes = "archived-notes";
SNSmartTag.SystemSmartTagIdTrashedNotes = "trashed-notes";
;
var SNTheme = exports.SNTheme = function (_SNComponent) {
  _inherits(SNTheme, _SNComponent);

  function SNTheme(json_obj) {
    _classCallCheck(this, SNTheme);

    var _this30 = _possibleConstructorReturn(this, (SNTheme.__proto__ || Object.getPrototypeOf(SNTheme)).call(this, json_obj));

    _this30.area = "themes";
    return _this30;
  }

  _createClass(SNTheme, [{
    key: "isLayerable",
    value: function isLayerable() {
      return this.package_info && this.package_info.layerable;
    }
  }, {
    key: "setMobileRules",
    value: function setMobileRules(rules) {
      this.setAppDataItem("mobileRules", rules);
    }
  }, {
    key: "getMobileRules",
    value: function getMobileRules() {
      return this.getAppDataItem("mobileRules") || { constants: {}, rules: {} };
    }

    // Same as getMobileRules but without default value

  }, {
    key: "hasMobileRules",
    value: function hasMobileRules() {
      return this.getAppDataItem("mobileRules");
    }
  }, {
    key: "setNotAvailOnMobile",
    value: function setNotAvailOnMobile(na) {
      this.setAppDataItem("notAvailableOnMobile", na);
    }
  }, {
    key: "getNotAvailOnMobile",
    value: function getNotAvailOnMobile() {
      return this.getAppDataItem("notAvailableOnMobile");
    }

    /* We must not use .active because if you set that to true, it will also activate that theme on desktop/web */

  }, {
    key: "setMobileActive",
    value: function setMobileActive(active) {
      this.setAppDataItem("mobileActive", active);
    }
  }, {
    key: "isMobileActive",
    value: function isMobileActive() {
      return this.getAppDataItem("mobileActive");
    }
  }, {
    key: "content_type",
    get: function get() {
      return "SN|Theme";
    }
  }, {
    key: "displayName",
    get: function get() {
      return "Theme";
    }
  }]);

  return SNTheme;
}(SNComponent);

;

if (typeof window !== 'undefined' && window !== null) {
  // window is for some reason defined in React Native, but throws an exception when you try to set to it
  try {
    window.SNNote = SNNote;
    window.SNTag = SNTag;
    window.SNSmartTag = SNSmartTag;
    window.SNMfa = SNMfa;
    window.SNServerExtension = SNServerExtension;
    window.SNComponent = SNComponent;
    window.SNEditor = SNEditor;
    window.SNExtension = SNExtension;
    window.SNTheme = SNTheme;
    window.SNEncryptedStorage = SNEncryptedStorage;
    window.SNComponentManager = SNComponentManager;
  } catch (e) {
    console.log("Exception while exporting snjs window variables", e);
  }
}
//# sourceMappingURL=transpiled.js.map
;'use strict';

var SN = SN || {};

angular.module('app', [
  'ngSanitize'
])

function getParameterByName(name, url) {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function parametersFromURL(url) {
  url = url.split("?").slice(-1)[0];
  var obj = {};
  url.replace(/([^=&]+)=([^&]*)/g, function(m, key, value) {
    obj[decodeURIComponent(key)] = decodeURIComponent(value);
  });
  return obj;
}

function getPlatformString() {
  try {
    var platform = navigator.platform.toLowerCase();
    var trimmed = "";
    if(platform.indexOf("mac") !== -1) {
      trimmed = "mac";
    } else if(platform.indexOf("win") !== -1) {
      trimmed = "windows";
    } if(platform.indexOf("linux") !== -1) {
      trimmed = "linux";
    }

    return trimmed + (isDesktopApplication() ? "-desktop" : "-web");
  } catch (e) {
    return null;
  }
}

function isDesktopApplication() {
  return window && window.process && window.process.type && window.process.versions["electron"];
}

function isMacApplication() {
  return window && window.process && window.process.type && window.process.platform == "darwin";
}

/* Use with numbers and strings, not objects */
Array.prototype.containsPrimitiveSubset = function(array) {
  return !array.some(val => this.indexOf(val) === -1);
}

// https://tc39.github.io/ecma262/#sec-array.prototype.includes
if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, 'includes', {
    value: function(searchElement, fromIndex) {

      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      // 1. Let O be ? ToObject(this value).
      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If len is 0, return false.
      if (len === 0) {
        return false;
      }

      // 4. Let n be ? ToInteger(fromIndex).
      //    (If fromIndex is undefined, this step produces the value 0.)
      var n = fromIndex | 0;

      // 5. If n ≥ 0, then
      //  a. Let k be n.
      // 6. Else n < 0,
      //  a. Let k be len + n.
      //  b. If k < 0, let k be 0.
      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

      function sameValueZero(x, y) {
        return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
      }

      // 7. Repeat, while k < len
      while (k < len) {
        // a. Let elementK be the result of ? Get(O, ! ToString(k)).
        // b. If SameValueZero(searchElement, elementK) is true, return true.
        if (sameValueZero(o[k], searchElement)) {
          return true;
        }
        // c. Increase k by 1.
        k++;
      }

      // 8. Return false
      return false;
    }
  });
}
;angular.module('app')

.constant('appVersion', '3.0.15')

;;angular.module('app')
  .config(function ($locationProvider) {

    if(!isDesktopApplication()) {
      if (window.history && window.history.pushState) {
        $locationProvider.html5Mode({
          enabled: true,
          requireBase: false
        });
      }
    } else {
      $locationProvider.html5Mode(false);
    }
  });
;class NoteHistoryEntry extends SFItemHistoryEntry {

  previewTitle() {
    return this.item.updated_at.toLocaleString();
  }

  previewSubTitle() {
    if(!this.hasPreviousEntry) {
      return `${this.textCharDiffLength} characters loaded`
    } else if(this.textCharDiffLength < 0) {
      return `${this.textCharDiffLength * -1} characters removed`
    } else if(this.textCharDiffLength > 0) {
      return `${this.textCharDiffLength} characters added`
    } else {
      return "Title or metadata changed"
    }
  }
}
;angular.module('app')
  .directive("editorSection", function($timeout, $sce){
    return {
      restrict: 'E',
      scope: {
        remove: "&",
        note: "=",
        updateTags: "&"
      },
      templateUrl: 'editor.html',
      replace: true,
      controller: 'EditorCtrl',
      controllerAs: 'ctrl',
      bindToController: true,

      link:function(scope, elem, attrs, ctrl) {
        scope.$watch('ctrl.note', (note, oldNote) => {
          if(note) {
            ctrl.noteDidChange(note, oldNote);
          }
        });
      }
    }
  })
  .controller('EditorCtrl', function ($sce, $timeout, authManager, $rootScope, actionsManager,
    syncManager, modelManager, themeManager, componentManager, storageManager, sessionHistory,
    privilegesManager, keyboardManager, desktopManager) {

    this.spellcheck = true;
    this.componentManager = componentManager;
    this.componentStack = [];
    this.isDesktop = isDesktopApplication();

    const MinimumStatusDurationMs = 400;

    syncManager.addEventHandler((eventName, data) => {
      if(!this.note) {
        return;
      }

      if(eventName == "sync:taking-too-long") {
        this.syncTakingTooLong = true;
      }

      else if(eventName == "sync:completed") {
        this.syncTakingTooLong = false;
        if(this.note.dirty) {
          // if we're still dirty, don't change status, a sync is likely upcoming.
        } else {
          let savedItem = data.savedItems.find((item) => item.uuid == this.note.uuid);
          let isInErrorState = this.saveError;
          if(isInErrorState || savedItem) {
            this.showAllChangesSavedStatus();
          }
        }
      } else if(eventName == "sync:error") {
        // only show error status in editor if the note is dirty. Otherwise, it means the originating sync
        // came from somewhere else and we don't want to display an error here.
        if(this.note.dirty){
          this.showErrorStatus();
        }
      }
    });

    // Right now this only handles offline saving status changes.
    this.syncStatusObserver = syncManager.registerSyncStatusObserver((status) => {
      if(status.localError) {
        $timeout(() => {
          this.showErrorStatus({
            message: "Offline Saving Issue",
            desc: "Changes not saved"
          });
        }, 500)
      } else {
      }
    })

    modelManager.addItemSyncObserver("editor-note-observer", "Note", (allItems, validItems, deletedItems, source) => {
      if(!this.note) { return; }

      // Before checking if isMappingSourceRetrieved, we check if this item was deleted via a local source,
      // such as alternating uuids during sign in. Otherwise, we only want to make interface updates if it's a
      // remote retrieved source.
      if(this.note.deleted || this.note.content.trashed) {
        $rootScope.notifyDelete();
        return;
      }

      if(!SFModelManager.isMappingSourceRetrieved(source)) {
        return;
      }

      var matchingNote = allItems.find((item) => {
        return item.uuid == this.note.uuid;
      });

      if(!matchingNote) {
        return;
      }

      // Update tags
      this.loadTagsString();
    });

    modelManager.addItemSyncObserver("editor-tag-observer", "Tag", (allItems, validItems, deletedItems, source) => {
      if(!this.note) { return; }

      for(var tag of allItems) {
        // If a tag is deleted then we'll have lost references to notes. Reload anyway.
        if(this.note.savedTagsString == null || tag.deleted || tag.hasRelationshipWithItem(this.note)) {
          this.loadTagsString();
          return;
        }
      }
    });


    modelManager.addItemSyncObserver("editor-component-observer", "SN|Component", (allItems, validItems, deletedItems, source) => {
      if(!this.note) { return; }

      // Reload componentStack in case new ones were added or removed
      this.reloadComponentStackArray();

      // Observe editor changes to see if the current note should update its editor
      var editors = allItems.filter(function(item) {
        return item.isEditor();
      });

      // If no editors have changed
      if(editors.length == 0) {
        return;
      }

      // Look through editors again and find the most proper one
      var editor = this.editorForNote(this.note);
      this.selectedEditor = editor;
      if(!editor) {
        this.reloadFont();
      }
    });

    this.noteDidChange = function(note, oldNote) {
      this.setNote(note, oldNote);
      this.reloadComponentContext();
    }

    this.setNote = function(note, oldNote) {
      this.showExtensions = false;
      this.showMenu = false;
      this.noteStatus = null;
      // When setting alt key down and deleting note, an alert will come up and block the key up event when alt is released.
      // We reset it on set note so that the alt menu restores to default.
      this.altKeyDown = false;
      this.loadTagsString();

      let onReady = () => {
        this.noteReady = true;
        $timeout(() => {
          this.loadPreferences();
        })
      }

      let associatedEditor = this.editorForNote(note);
      if(associatedEditor && associatedEditor != this.selectedEditor) {
        // setting note to not ready will remove the editor from view in a flash,
        // so we only want to do this if switching between external editors
        this.noteReady = false;
        // switch after timeout, so that note data isnt posted to current editor
        $timeout(() => {
          this.selectedEditor = associatedEditor;
          onReady();
        })
      } else if(associatedEditor) {
        // Same editor as currently active
        onReady();
      } else {
        // No editor
        this.selectedEditor = null;
        onReady();
      }

      if(note.safeText().length == 0 && note.dummy) {
        this.focusTitle(100);
      }

      if(oldNote && oldNote != note) {
        if(oldNote.dirty) {
          this.saveNote(oldNote);
        } else if(oldNote.dummy) {
          this.remove()(oldNote);
        }
      }
    }

    this.editorForNote = function(note) {
      return componentManager.editorForNote(note);
    }

    this.closeAllMenus = function() {
      this.showEditorMenu = false;
      this.showMenu = false;
      this.showExtensions = false;
    }

    this.toggleMenu = function(menu) {
      this[menu] = !this[menu];

      let allMenus = ['showMenu', 'showEditorMenu', 'showExtensions', 'showSessionHistory'];
      for(var candidate of allMenus) {
        if(candidate != menu) {
          this[candidate] = false;
        }
      }
    }

    this.editorMenuOnSelect = function(component) {
      if(!component || component.area == "editor-editor") {
        // if plain editor or other editor
        this.showEditorMenu = false;
        var editor = component;
        if(this.selectedEditor && editor !== this.selectedEditor) {
          this.disassociateComponentWithCurrentNote(this.selectedEditor);
        }
        if(editor) {
          if(this.note.getAppDataItem("prefersPlainEditor") == true) {
            this.note.setAppDataItem("prefersPlainEditor", false);
            modelManager.setItemDirty(this.note, true);
          }
          this.associateComponentWithCurrentNote(editor);
        } else {
          // Note prefers plain editor
          if(!this.note.getAppDataItem("prefersPlainEditor")) {
            this.note.setAppDataItem("prefersPlainEditor", true);
            modelManager.setItemDirty(this.note, true);
          }
          $timeout(() => {
            this.reloadFont();
          })
        }

        this.selectedEditor = editor;
      } else if(component.area == "editor-stack") {
        // If component stack item
        this.toggleStackComponentForCurrentItem(component);
      }

      // Lots of dirtying can happen above, so we'll sync
      syncManager.sync();
    }.bind(this)

    this.hasAvailableExtensions = function() {
      return actionsManager.extensionsInContextOfItem(this.note).length > 0;
    }

    this.focusEditor = function(delay) {
      setTimeout(function(){
        var element = document.getElementById("note-text-editor");
        if(element) {
          element.focus();
        }
      }, delay)
    }

    this.focusTitle = function(delay) {
      setTimeout(function(){
        document.getElementById("note-title-editor").focus();
      }, delay)
    }

    this.clickedTextArea = function() {
      this.showMenu = false;
    }

    this.EditorNgDebounce = 200;
    const SyncDebouce = 350;
    const SyncNoDebounce = 100;

    this.saveNote = function({bypassDebouncer, updateClientModified, dontUpdatePreviews}) {
      let note = this.note;
      note.dummy = false;

      if(note.deleted) {
        alert("The note you are attempting to edit has been deleted, and is awaiting sync. Changes you make will be disregarded.");
        return;
      }

      if(!modelManager.findItem(note.uuid)) {
        alert("The note you are attempting to save can not be found or has been deleted. Changes you make will not be synced. Please copy this note's text and start a new note.");
        return;
      }

      this.showSavingStatus();

      if(!dontUpdatePreviews) {
        let limit = 80;
        var text = note.text || "";
        var truncate = text.length > limit;
        note.content.preview_plain = text.substring(0, limit) + (truncate ? "..." : "");
        // Clear dynamic previews if using plain editor
        note.content.preview_html = null;
      }

      modelManager.setItemDirty(note, true, updateClientModified);

      if(this.saveTimeout) {
        $timeout.cancel(this.saveTimeout);
      }

      let syncDebouceMs;
      if(authManager.offline() || bypassDebouncer) {
        syncDebouceMs = SyncNoDebounce;
      } else {
        syncDebouceMs = SyncDebouce;
      }

      this.saveTimeout = $timeout(() => {
        syncManager.sync().then((response) => {
          if(response && response.error && !this.didShowErrorAlert) {
            this.didShowErrorAlert = true;
            alert("There was an error saving your note. Please try again.");
          }
        })
      }, syncDebouceMs)
    }

    this.showSavingStatus = function() {
      this.setStatus({message: "Saving..."}, false);
    }

    this.showAllChangesSavedStatus = function() {
      this.saveError = false;
      this.syncTakingTooLong = false;

      var status = "All changes saved";
      if(authManager.offline()) {
        status += " (offline)";
      }

      this.setStatus({message: status});
    }

    this.showErrorStatus = function(error) {
      if(!error) {
        error = {
          message: "Sync Unreachable",
          desc: "Changes saved offline"
        }
      }
      this.saveError = true;
      this.syncTakingTooLong = false;
      this.setStatus(error);
    }

    this.setStatus = function(status, wait = true) {
      // Keep every status up for a minimum duration so it doesnt flash crazily.
      let waitForMs;
      if(!this.noteStatus || !this.noteStatus.date) {
        waitForMs = 0;
      } else {
        waitForMs = MinimumStatusDurationMs - (new Date() - this.noteStatus.date);
      }
      if(!wait || waitForMs < 0) {waitForMs = 0;}
      if(this.statusTimeout) $timeout.cancel(this.statusTimeout);
      this.statusTimeout = $timeout(() => {
        status.date = new Date();
        this.noteStatus = status;
      }, waitForMs)
    }

    this.contentChanged = function() {
      this.saveNote({updateClientModified: true});
    }

    this.onTitleEnter = function($event) {
      $event.target.blur();
      this.onTitleChange();
      this.focusEditor();
    }

    this.onTitleChange = function() {
      this.saveNote({dontUpdatePreviews: true, updateClientModified: true});
    }

    this.onNameFocus = function() {
      this.editingName = true;
    }

    this.onContentFocus = function() {
      $rootScope.$broadcast("editorFocused");
    }

    this.onNameBlur = function() {
      this.editingName = false;
    }

    this.selectedMenuItem = function(hide) {
      if(hide) {
        this.showMenu = false;
      }
    }

    this.deleteNote = async function(permanently) {
      let run = () => {
        $timeout(() => {
          if(this.note.locked) {
            alert("This note is locked. If you'd like to delete it, unlock it, and try again.");
            return;
          }

          let title = this.note.safeTitle().length ? `'${this.note.title}'` : "this note";
          let message = permanently ? `Are you sure you want to permanently delete ${title}?`
            : `Are you sure you want to move ${title} to the trash?`
          if(confirm(message)) {
            if(permanently) {
              this.remove()(this.note);
            } else {
              this.note.content.trashed = true;
              this.saveNote({bypassDebouncer: true, dontUpdatePreviews: true});
            }
            this.showMenu = false;
          }
        });
      }

      if(await privilegesManager.actionRequiresPrivilege(PrivilegesManager.ActionDeleteNote)) {
        privilegesManager.presentPrivilegesModal(PrivilegesManager.ActionDeleteNote, () => {
          run();
        });
      } else {
        run();
      }
    }

    this.restoreTrashedNote = function() {
      this.note.content.trashed = false;
      this.saveNote({bypassDebouncer: true, dontUpdatePreviews: true});
    }

    this.deleteNotePermanantely = function() {
      this.deleteNote(true);
    }

    this.getTrashCount = function() {
      return modelManager.trashedItems().length;
    }

    this.emptyTrash = function() {
      let count = this.getTrashCount();
      if(confirm(`Are you sure you want to permanently delete ${count} note(s)?`)) {
        modelManager.emptyTrash();
        syncManager.sync();
      }
    }

    this.togglePin = function() {
      this.note.setAppDataItem("pinned", !this.note.pinned);
      this.saveNote({bypassDebouncer: true, dontUpdatePreviews: true});
    }

    this.toggleLockNote = function() {
      this.note.setAppDataItem("locked", !this.note.locked);
      this.saveNote({bypassDebouncer: true, dontUpdatePreviews: true});
    }

    this.toggleProtectNote = function() {
      this.note.content.protected = !this.note.content.protected;
      this.saveNote({bypassDebouncer: true, dontUpdatePreviews: true});

      // Show privilegesManager if Protection is not yet set up
      privilegesManager.actionHasPrivilegesConfigured(PrivilegesManager.ActionViewProtectedNotes).then((configured) => {
        if(!configured) {
          privilegesManager.presentPrivilegesManagementModal();
        }
      })
    }

    this.toggleNotePreview = function() {
      this.note.content.hidePreview = !this.note.content.hidePreview;
      this.saveNote({bypassDebouncer: true, dontUpdatePreviews: true});
    }

    this.toggleArchiveNote = function() {
      this.note.setAppDataItem("archived", !this.note.archived);
      this.saveNote({bypassDebouncer: true, dontUpdatePreviews: true});
      $rootScope.$broadcast("noteArchived");
    }

    this.clickedEditNote = function() {
      this.focusEditor(100);
    }








    /*
    Tags
    */

    this.loadTagsString = function() {
      this.tagsString = this.note.tagsString();
    }

    this.addTag = function(tag) {
      var tags = this.note.tags;
      var strings = tags.map(function(_tag){
        return _tag.title;
      })
      strings.push(tag.title);
      this.updateTags()(this.note, strings);
      this.loadTagsString();
    }

    this.removeTag = function(tag) {
      var tags = this.note.tags;
      var strings = tags.map(function(_tag){
        return _tag.title;
      }).filter(function(_tag){
        return _tag !== tag.title;
      })
      this.updateTags()(this.note, strings);
      this.loadTagsString();
    }

    this.updateTagsFromTagsString = function() {
      if(this.tagsString == this.note.tagsString()) {
        return;
      }

      var strings = this.tagsString.split("#").filter((string) => {
        return string.length > 0;
      }).map((string) => {
        return string.trim();
      })

      this.note.dummy = false;
      this.updateTags()(this.note, strings);
    }


    /* Resizability */

    this.leftResizeControl = {};
    this.rightResizeControl = {};

    this.onPanelResizeFinish = (width, left, isMaxWidth) => {
      if(isMaxWidth) {
        authManager.setUserPrefValue("editorWidth", null);
      } else {
        if(width !== undefined && width !== null) {
          authManager.setUserPrefValue("editorWidth", width);
          this.leftResizeControl.setWidth(width);
        }
      }

      if(left !== undefined && left !== null) {
        authManager.setUserPrefValue("editorLeft", left);
        this.rightResizeControl.setLeft(left);
      }
      authManager.syncUserPreferences();
    }

    $rootScope.$on("user-preferences-changed", () => {
      this.loadPreferences();
    });

    this.loadPreferences = function() {
      this.monospaceFont = authManager.getUserPrefValue("monospaceFont", "monospace");

      // On desktop application, disable spellcheck by default, as it is not performant.
      let defaultSpellcheckStatus = isDesktopApplication() ? false : true;
      this.spellcheck = authManager.getUserPrefValue("spellcheck", defaultSpellcheckStatus);

      this.marginResizersEnabled = authManager.getUserPrefValue("marginResizersEnabled", true);

      if(!document.getElementById("editor-content")) {
        // Elements have not yet loaded due to ng-if around wrapper
        return;
      }

      this.reloadFont();

      if(this.marginResizersEnabled) {
        let width = authManager.getUserPrefValue("editorWidth", null);
        if(width !== null) {
          this.leftResizeControl.setWidth(width);
          this.rightResizeControl.setWidth(width);
        }

        let left = authManager.getUserPrefValue("editorLeft", null);
        if(left !== null) {
          this.leftResizeControl.setLeft(left);
          this.rightResizeControl.setLeft(left);
        }
      }
    }

    this.reloadFont = function() {
      var editable = document.getElementById("note-text-editor");

      if(!editable) {
        return;
      }

      if(this.monospaceFont) {
        if(isDesktopApplication()) {
          editable.style.fontFamily = "Menlo, Consolas, 'DejaVu Sans Mono', monospace";
        } else {
          editable.style.fontFamily = "monospace";
        }
      } else {
        editable.style.fontFamily = "inherit";
      }
    }

    this.toggleKey = function(key) {
      this[key] = !this[key];
      authManager.setUserPrefValue(key, this[key], true);
      this.reloadFont();

      if(key == "spellcheck") {
        // Allows textarea to reload
        this.noteReady = false;
        $timeout(() => {
          this.noteReady = true;
          $timeout(() => {
            this.reloadFont();
          })
        }, 0)
      } else if(key == "marginResizersEnabled" && this[key] == true) {
        $timeout(() => {
          this.leftResizeControl.flash();
          this.rightResizeControl.flash();
        })
      }
    }



    /*
    Components
    */

    this.onEditorLoad = function(editor) {
      desktopManager.redoSearch();
    }

    componentManager.registerHandler({identifier: "editor", areas: ["note-tags", "editor-stack", "editor-editor"], activationHandler: (component) => {
      if(component.area === "note-tags") {
        // Autocomplete Tags
        this.tagsComponent = component.active ? component : null;
      } else if(component.area == "editor-editor") {
        // An editor is already active, ensure the potential replacement is explicitely enabled for this item
        // We also check if the selectedEditor is active. If it's inactive, we want to treat it as an external reference wishing to deactivate this editor (i.e componentView)
        if(this.selectedEditor && this.selectedEditor == component && component.active == false) {
          this.selectedEditor = null;
        }
        else if(this.selectedEditor) {
          if(this.selectedEditor.active) {
            // In the case where an editor is duplicated, then you'll have two editors who are explicitely enabled for the same note.
            // This will cause an infinite loop, where as soon as the first is enabled, the second will come in, pass the `isExplicitlyEnabledForItem` check,
            // and replace the previous one. So we now check to make the current editor isn't also explicitely enabled, and if it is, then we'll just keep that one active.
            if(component.isExplicitlyEnabledForItem(this.note) && !this.selectedEditor.isExplicitlyEnabledForItem(this.note)) {
              this.selectedEditor = component;
            }
          }
        }
        else {
          // If no selected editor, let's see if the incoming one is a candidate
          if(component.active && this.note && (component.isExplicitlyEnabledForItem(this.note) || component.isDefaultEditor())) {
            this.selectedEditor = component;
          } else {
            // Not a candidate, and no selected editor. Disable the current editor by setting selectedEditor to null
            this.selectedEditor = null;
          }
        }

      } else if(component.area == "editor-stack") {
        this.reloadComponentContext();
      }
    }, contextRequestHandler: (component) => {
      if(component == this.selectedEditor || component == this.tagsComponent || this.componentStack.includes(component)) {
        return this.note;
      }
    }, focusHandler: (component, focused) => {
      if(component.isEditor() && focused) {
        this.closeAllMenus();
      }
    }, actionHandler: (component, action, data) => {
      if(action === "set-size") {
        var setSize = function(element, size) {
          var widthString = typeof size.width === 'string' ? size.width : `${data.width}px`;
          var heightString = typeof size.height === 'string' ? size.height : `${data.height}px`;
          element.setAttribute("style", `width:${widthString}; height:${heightString}; `);
        }

        if(data.type == "container") {
          if(component.area == "note-tags") {
            var container = document.getElementById("note-tags-component-container");
            setSize(container, data);
          }
        }
      }

      else if(action === "associate-item") {
        if(data.item.content_type == "Tag") {
          var tag = modelManager.findItem(data.item.uuid);
          this.addTag(tag);
        }
      }

      else if(action === "deassociate-item") {
        var tag = modelManager.findItem(data.item.uuid);
        this.removeTag(tag);
      }

      else if(action === "save-items") {
        if(data.items.map((item) => {return item.uuid}).includes(this.note.uuid)) {
          this.showSavingStatus();
        }
      }
    }});

    this.reloadComponentStackArray = function() {
      this.componentStack = componentManager.componentsForArea("editor-stack").sort((a, b) => {
        // Careful here. For some reason (probably because re-assigning array everytime quickly destroys componentView elements, causing deallocs),
        // sorting by updated_at (or any other property that may always be changing)
        // causes weird problems with ext communication when changing notes or activating/deactivating in quick succession
        return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
      });
    }

    this.reloadComponentContext = function() {
      // componentStack is used by the template to ng-repeat
      this.reloadComponentStackArray();
      /*
      In the past, we were doing this looping code even if the note wasn't currently defined.
      The problem is if an editor stack item loaded first, requested to stream items, and the note was undefined,
      we would set component.hidden = true. Which means messages would not be sent to the component.
      Theoretically, upon the note loading, we would run this code again, and unhide the extension.
      However, if you had requested to stream items when it was hidden, and then it unhid, it would never
      resend those items upon unhiding.

      Our solution here is to check that the note is defined before setting hidden. The question remains, when
      would note really ever be undefined? Maybe temprarily when you're deleting a note?
      */
      if(this.note) {
        for(var component of this.componentStack) {
          if(component.active) {
            componentManager.setComponentHidden(component, !component.isExplicitlyEnabledForItem(this.note));
          }
        }
      }

      componentManager.contextItemDidChangeInArea("note-tags");
      componentManager.contextItemDidChangeInArea("editor-stack");
      componentManager.contextItemDidChangeInArea("editor-editor");
    }

    this.toggleStackComponentForCurrentItem = function(component) {
      // If it's hidden, we want to show it
      // If it's not active, then hidden won't be set, and we mean to activate and show it.
      if(component.hidden || !component.active) {
        // Unhide, associate with current item
        componentManager.setComponentHidden(component, false);
        this.associateComponentWithCurrentNote(component);
        if(!component.active) {
          componentManager.activateComponent(component);
        }
        componentManager.contextItemDidChangeInArea("editor-stack");
      } else {
        // not hidden, hide
        componentManager.setComponentHidden(component, true);
        this.disassociateComponentWithCurrentNote(component);
      }
    }

    this.disassociateComponentWithCurrentNote = function(component) {
      component.associatedItemIds = component.associatedItemIds.filter((id) => {return id !== this.note.uuid});

      if(!component.disassociatedItemIds.includes(this.note.uuid)) {
        component.disassociatedItemIds.push(this.note.uuid);
      }

      modelManager.setItemDirty(component, true);
      syncManager.sync();
    }

    this.associateComponentWithCurrentNote = function(component) {
      component.disassociatedItemIds = component.disassociatedItemIds.filter((id) => {return id !== this.note.uuid});

      if(!component.associatedItemIds.includes(this.note.uuid)) {
        component.associatedItemIds.push(this.note.uuid);
      }

      modelManager.setItemDirty(component, true);
      syncManager.sync();
    }

    this.altKeyObserver = keyboardManager.addKeyObserver({
      modifiers: [KeyboardManager.KeyModifierAlt],
      onKeyDown: () => {
        $timeout(() => {
          this.altKeyDown = true;
        })
      },
      onKeyUp: () => {
        $timeout(() => {
          this.altKeyDown = false;
        });
      }
    })

    this.trashKeyObserver = keyboardManager.addKeyObserver({
      key: KeyboardManager.KeyBackspace,
      notElementIds: ["note-text-editor", "note-title-editor"],
      modifiers: [KeyboardManager.KeyModifierMeta],
      onKeyDown: () => {
        $timeout(() => {
          this.deleteNote();
        });
      },
    })

    this.deleteKeyObserver = keyboardManager.addKeyObserver({
      key: KeyboardManager.KeyBackspace,
      modifiers: [KeyboardManager.KeyModifierMeta, KeyboardManager.KeyModifierShift, KeyboardManager.KeyModifierAlt],
      onKeyDown: (event) => {
        event.preventDefault();
        $timeout(() => {
          this.deleteNote(true);
        });
      },
    })

    /*
    Editor Customization
    */

    this.onSystemEditorLoad = function() {
      if(this.loadedTabListener) {
        return;
      }
      this.loadedTabListener = true;

      /**
       * Insert 4 spaces when a tab key is pressed,
       * only used when inside of the text editor.
       * If the shift key is pressed first, this event is
       * not fired.
      */

      const editor = document.getElementById("note-text-editor");
      this.tabObserver = keyboardManager.addKeyObserver({
        element: editor,
        key: KeyboardManager.KeyTab,
        onKeyDown: (event) => {
          if(event.shiftKey) {
            return;
          }

          if(this.note.locked) {
            return;
          }

          event.preventDefault();

          // Using document.execCommand gives us undo support
          let insertSuccessful = document.execCommand("insertText", false, "\t");
          if(!insertSuccessful) {
            // document.execCommand works great on Chrome/Safari but not Firefox
            var start = editor.selectionStart;
            var end = editor.selectionEnd;
            var spaces = "    ";

             // Insert 4 spaces
            editor.value = editor.value.substring(0, start)
              + spaces + editor.value.substring(end);

            // Place cursor 4 spaces away from where
            // the tab key was pressed
            editor.selectionStart = editor.selectionEnd = start + 4;
          }

          $timeout(() => {
            this.note.text = editor.value;
            this.saveNote({bypassDebouncer: true});
          })
        },
      })

      // This handles when the editor itself is destroyed, and not when our controller is destroyed.
      angular.element(editor).on('$destroy', function(){
        if(this.tabObserver) {
          keyboardManager.removeKeyObserver(this.tabObserver);
          this.loadedTabListener = false;
        }
      }.bind(this));
    }
});
;angular.module('app')
  .directive("footer", function(authManager){
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'footer.html',
      replace: true,
      controller: 'FooterCtrl',
      controllerAs: 'ctrl',
      bindToController: true,

      link:function(scope, elem, attrs, ctrl) {
        scope.$on("sync:completed", function(){
          ctrl.syncUpdated();
          ctrl.findErrors();
          ctrl.updateOfflineStatus();
        })
        scope.$on("sync:error", function(){
          ctrl.findErrors();
          ctrl.updateOfflineStatus();
        })
      }
    }
  })
  .controller('FooterCtrl', function ($rootScope, authManager, modelManager, $timeout, dbManager,
    syncManager, storageManager, passcodeManager, componentManager, singletonManager, nativeExtManager,
    privilegesManager, statusManager) {

      authManager.checkForSecurityUpdate().then((available) => {
        this.securityUpdateAvailable = available;
      })

      $rootScope.$on("security-update-status-changed", () => {
        this.securityUpdateAvailable = authManager.securityUpdateAvailable;
      })

      statusManager.addStatusObserver((string) => {
        $timeout(() => {
          this.arbitraryStatusMessage = string;
        })
      })

      $rootScope.$on("did-begin-local-backup", () => {
        $timeout(() => {
          this.backupStatus = statusManager.addStatusFromString("Saving local backup...");
        })
      });

      $rootScope.$on("did-finish-local-backup", (event, data) => {
        $timeout(() => {
          if(data.success) {
            this.backupStatus = statusManager.replaceStatusWithString(this.backupStatus, "Successfully saved backup.");
          } else {
            this.backupStatus = statusManager.replaceStatusWithString(this.backupStatus, "Unable to save local backup.");
          }

          $timeout(() => {
            this.backupStatus = statusManager.removeStatus(this.backupStatus);
          }, 2000)
        })
      });

      this.openSecurityUpdate = function() {
        authManager.presentPasswordWizard("upgrade-security");
      }

      $rootScope.$on("reload-ext-data", () => {
        this.reloadExtendedData();
      });

      this.reloadExtendedData = () => {
        if(this.reloadInProgress) { return; }
        this.reloadInProgress = true;

        // A reload occurs when the extensions manager window is opened. We can close it after a delay
        let extWindow = this.rooms.find((room) => {return room.package_info.identifier == nativeExtManager.extensionsManagerIdentifier});
        if(!extWindow) {
          this.queueExtReload = true; // try again when the ext is available
          this.reloadInProgress = false;
          return;
        }

        this.selectRoom(extWindow);

        $timeout(() => {
          this.selectRoom(extWindow);
          this.reloadInProgress = false;
          $rootScope.$broadcast("ext-reload-complete");
        }, 2000);
      }

      this.getUser = function() {
        return authManager.user;
      }

      this.updateOfflineStatus = function() {
        this.offline = authManager.offline();
      }
      this.updateOfflineStatus();


      syncManager.addEventHandler((syncEvent, data) => {
        $timeout(() => {
          if(syncEvent == "local-data-loaded") {
            // If the user has no notes and is offline, show Account menu
            if(this.offline && modelManager.noteCount() == 0) {
              this.showAccountMenu = true;
            }
          } else if(syncEvent == "enter-out-of-sync") {
            this.outOfSync = true;
          } else if(syncEvent == "exit-out-of-sync") {
            this.outOfSync = false;
          }
        })
      });

      this.findErrors = function() {
        this.error = syncManager.syncStatus.error;
      }
      this.findErrors();

      this.onAuthSuccess = function() {
        this.showAccountMenu = false;
      }.bind(this)

      this.accountMenuPressed = function() {
        this.showAccountMenu = !this.showAccountMenu;
        this.closeAllRooms();
      }

      this.toggleSyncResolutionMenu = function() {
        this.showSyncResolution = !this.showSyncResolution;
      }.bind(this);

      this.closeAccountMenu = () => {
        this.showAccountMenu = false;
      }

      this.hasPasscode = function() {
        return passcodeManager.hasPasscode();
      }

      this.lockApp = function() {
        $rootScope.lockApplication();
      }

      this.refreshData = function() {
        this.isRefreshing = true;
        // Enable integrity checking for this force request
        syncManager.sync({force: true, performIntegrityCheck: true}).then((response) => {
          $timeout(function(){
            this.isRefreshing = false;
          }.bind(this), 200)
          if(response && response.error) {
            alert("There was an error syncing. Please try again. If all else fails, try signing out and signing back in.");
          } else {
            this.syncUpdated();
          }
        });
      }

      this.syncUpdated = function() {
        this.lastSyncDate = new Date();
      }

      $rootScope.$on("new-update-available", function(version){
        $timeout(function(){
          // timeout calls apply() which is needed
          this.onNewUpdateAvailable();
        }.bind(this))
      }.bind(this))

      this.onNewUpdateAvailable = function() {
        this.newUpdateAvailable = true;
      }

      this.clickedNewUpdateAnnouncement = function() {
        this.newUpdateAvailable = false;
        alert("A new update is ready to install. Please use the top-level 'Updates' menu to manage installation.")
      }


      /* Rooms */

      this.componentManager = componentManager;
      this.rooms = [];
      this.themesWithIcons = [];

      modelManager.addItemSyncObserver("room-bar", "SN|Component", (allItems, validItems, deletedItems, source) => {
        this.rooms = modelManager.components.filter((candidate) => {return candidate.area == "rooms" && !candidate.deleted});
        if(this.queueExtReload) {
          this.queueExtReload = false;
          this.reloadExtendedData();
        }
      });

      modelManager.addItemSyncObserver("footer-bar-themes", "SN|Theme", (allItems, validItems, deletedItems, source) => {
        let themes = modelManager.validItemsForContentType("SN|Theme").filter((candidate) => {
          return !candidate.deleted && candidate.content.package_info && candidate.content.package_info.dock_icon;
        }).sort((a, b) => {
          return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
        });

        let differ = themes.length != this.themesWithIcons.length;

        this.themesWithIcons = themes;

        if(differ) {
          this.reloadDockShortcuts();
        }
      });

      this.reloadDockShortcuts = function() {
        let shortcuts = [];
        for(var theme of this.themesWithIcons) {
          var icon = theme.content.package_info.dock_icon;
          if(!icon) {
            continue;
          }
          shortcuts.push({
            component: theme,
            icon: icon
          })
        }

        this.dockShortcuts = shortcuts.sort((a, b) => {
          // circles first, then images

          var aType = a.icon.type;
          var bType = b.icon.type;

          if(aType == bType) {
            return 0;
          } else if(aType == "circle" && bType == "svg") {
            return -1;
          } else if(bType == "circle" && aType == "svg") {
            return 1;
          }
        });
      }

      this.initSvgForShortcut = function(shortcut) {
        var id = "dock-svg-" + shortcut.component.uuid;
        var element = document.getElementById(id);
        var parser = new DOMParser();
        var svg = shortcut.component.content.package_info.dock_icon.source;
        var doc = parser.parseFromString(svg, "image/svg+xml");
        element.appendChild(doc.documentElement);
      }

      this.selectShortcut = function(shortcut) {
        componentManager.toggleComponent(shortcut.component);
      }

      componentManager.registerHandler({identifier: "roomBar", areas: ["rooms", "modal"], activationHandler: (component) => {
        // RIP: There used to be code here that checked if component.active was true, and if so, displayed the component.
        // However, we no longer want to persist active state for footer extensions. If you open Extensions on one computer,
        // it shouldn't open on another computer. Active state should only be persisted for persistent extensions, like Folders.
      }, actionHandler: (component, action, data) => {
        if(action == "set-size") {
          component.setLastSize(data);
        }
      }, focusHandler: (component, focused) => {
        if(component.isEditor() && focused) {
          this.closeAllRooms();
          this.closeAccountMenu();
        }
      }});

      $rootScope.$on("editorFocused", () => {
        this.closeAllRooms();
        this.closeAccountMenu();
      })

      this.onRoomDismiss = function(room) {
        room.showRoom = false;
      }

      this.closeAllRooms = function() {
        for(var room of this.rooms) {
          room.showRoom = false;
        }
      }

      this.selectRoom = async function(room) {
        let run = () => {
          $timeout(() => {
            room.showRoom = !room.showRoom;
          })
        }

        if(!room.showRoom) {
          // About to show, check if has privileges
          if(await privilegesManager.actionRequiresPrivilege(PrivilegesManager.ActionManageExtensions)) {
            privilegesManager.presentPrivilegesModal(PrivilegesManager.ActionManageExtensions, () => {
              run();
            });
          } else {
            run();
          }
        } else {
          run();
        }
      }

      this.clickOutsideAccountMenu = function() {
        if(privilegesManager.authenticationInProgress()) {
          return;
        }
        this.showAccountMenu = false;
      }
});
;angular.module('app')
.controller('HomeCtrl', function ($scope, $location, $rootScope, $timeout, modelManager,
  dbManager, syncManager, authManager, themeManager, passcodeManager, storageManager, migrationManager,
  privilegesManager, statusManager) {

    storageManager.initialize(passcodeManager.hasPasscode(), authManager.isEphemeralSession());

    $scope.platform = getPlatformString();

    $scope.onUpdateAvailable = function(version) {
      $rootScope.$broadcast('new-update-available', version);
    }

    $rootScope.$on("panel-resized", (event, info) => {
      if(info.panel == "notes") { this.notesCollapsed = info.collapsed; }
      if(info.panel == "tags") { this.tagsCollapsed = info.collapsed; }

      let appClass = "";
      if(this.notesCollapsed) { appClass += "collapsed-notes"; }
      if(this.tagsCollapsed) { appClass += " collapsed-tags"; }

      $scope.appClass = appClass;
    })

    /* Used to avoid circular dependencies where syncManager cannot be imported but rootScope can */
    $rootScope.sync = function(source) {
      syncManager.sync();
    }

    $rootScope.lockApplication = function() {
      // Reloading wipes current objects from memory
      window.location.reload();
    }

    const initiateSync = () => {
      authManager.loadInitialData();

      this.syncStatusObserver = syncManager.registerSyncStatusObserver((status) => {
        if(status.retrievedCount > 20) {
          var text = `Downloading ${status.retrievedCount} items. Keep app open.`
          this.syncStatus = statusManager.replaceStatusWithString(this.syncStatus, text);
          this.showingDownloadStatus = true;
        } else if(this.showingDownloadStatus) {
          this.showingDownloadStatus = false;
          var text = "Download Complete.";
          this.syncStatus = statusManager.replaceStatusWithString(this.syncStatus, text);
          setTimeout(() => {
            this.syncStatus = statusManager.removeStatus(this.syncStatus);
          }, 2000);
        } else if(status.total > 20) {
          this.uploadSyncStatus = statusManager.replaceStatusWithString(this.uploadSyncStatus, `Syncing ${status.current}/${status.total} items...`)
        } else if(this.uploadSyncStatus) {
          this.uploadSyncStatus = statusManager.removeStatus(this.uploadSyncStatus);
        }
      })

      syncManager.setKeyRequestHandler(async () => {
        let offline = authManager.offline();
        let auth_params = offline ? passcodeManager.passcodeAuthParams() : await authManager.getAuthParams();
        let keys = offline ? passcodeManager.keys() : await authManager.keys();
        return {
          keys: keys,
          offline: offline,
          auth_params: auth_params
        }
      });

      let lastSessionInvalidAlert;

      syncManager.addEventHandler((syncEvent, data) => {
        $rootScope.$broadcast(syncEvent, data || {});
        if(syncEvent == "sync-session-invalid") {
          // On Windows, some users experience issues where this message keeps appearing. It might be that on focus, the app syncs, and this message triggers again.
          // We'll only show it once every X seconds
          let showInterval = 30; // At most 30 seconds in between
          if(!lastSessionInvalidAlert || (new Date() - lastSessionInvalidAlert)/1000 > showInterval) {
            lastSessionInvalidAlert = new Date();
            setTimeout(function () {
              // If this alert is displayed on launch, it may sometimes dismiss automatically really quicky for some reason. So we wrap in timeout
              alert("Your session has expired. New changes will not be pulled in. Please sign out and sign back in to refresh your session.");
            }, 500);
          }
        } else if(syncEvent == "sync-exception") {
          alert(`There was an error while trying to save your items. Please contact support and share this message: ${data}`);
        }
      });

      let encryptionEnabled = authManager.user || passcodeManager.hasPasscode();
      this.syncStatus = statusManager.addStatusFromString(encryptionEnabled ? "Decrypting items..." : "Loading items...");

      let incrementalCallback = (current, total) => {
        let notesString = `${current}/${total} items...`
        this.syncStatus = statusManager.replaceStatusWithString(this.syncStatus, encryptionEnabled ? `Decrypting ${notesString}` : `Loading ${notesString}`);
      }

      syncManager.loadLocalItems({incrementalCallback}).then(() => {
        $timeout(() => {
          $rootScope.$broadcast("initial-data-loaded"); // This needs to be processed first before sync is called so that singletonManager observers function properly.
          // Perform integrity check on first sync
          this.syncStatus = statusManager.replaceStatusWithString(this.syncStatus, "Syncing...");
          syncManager.sync({performIntegrityCheck: true}).then(() => {
            this.syncStatus = statusManager.removeStatus(this.syncStatus);
          })
          // refresh every 30s
          setInterval(function () {
            syncManager.sync();
          }, 30000);
        })
      });

      authManager.addEventHandler((event) => {
        if(event == SFAuthManager.DidSignOutEvent) {
          modelManager.handleSignout();
          syncManager.handleSignout();
        }
      })
    }

    function load() {
      // pass keys to storageManager to decrypt storage
      // Update: Wait, why? passcodeManager already handles this.
      // storageManager.setKeys(passcodeManager.keys());

      openDatabase();
      // Retrieve local data and begin sycing timer
      initiateSync();
    }

    if(passcodeManager.isLocked()) {
      $scope.needsUnlock = true;
    } else {
      load();
    }

    $scope.onSuccessfulUnlock = function() {
      $timeout(() => {
        $scope.needsUnlock = false;
        load();
      })
    }

    function openDatabase() {
      dbManager.setLocked(false);
      dbManager.openDatabase(null, function() {
        // new database, delete syncToken so that items can be refetched entirely from server
        syncManager.clearSyncToken();
        syncManager.sync();
      })
    }

    /*
    Editor Callbacks
    */

    $scope.updateTagsForNote = function(note, stringTags) {
      var toRemove = [];
      for(var tag of note.tags) {
        if(stringTags.indexOf(tag.title) === -1) {
          // remove this tag
          toRemove.push(tag);
        }
      }

      for(var tagToRemove of toRemove) {
        tagToRemove.removeItemAsRelationship(note);
      }

      modelManager.setItemsDirty(toRemove, true);

      var tags = [];
      for(var tagString of stringTags) {
        var existingRelationship = _.find(note.tags, {title: tagString});
        if(!existingRelationship) {
          tags.push(modelManager.findOrCreateTagByTitle(tagString));
        }
      }

      for(var tag of tags) {
        tag.addItemAsRelationship(note);
      }

      modelManager.setItemsDirty(tags, true);

      syncManager.sync();
    }

    /*
    Tags Ctrl Callbacks
    */

    $scope.tagsSelectionMade = function(tag) {
      // If a tag is selected twice, then the needed dummy note is removed.
      // So we perform this check.
      if($scope.selectedTag && tag && $scope.selectedTag.uuid == tag.uuid) {
        return;
      }

      if($scope.selectedNote && $scope.selectedNote.dummy) {
        modelManager.removeItemLocally($scope.selectedNote);
        $scope.selectedNote = null;
      }

      $scope.selectedTag = tag;
    }

    $scope.tagsAddNew = function(tag) {
      modelManager.addItem(tag);
    }

    $scope.tagsSave = function(tag, callback) {
      if(!tag.title || tag.title.length == 0) {
        $scope.removeTag(tag);
        return;
      }

      modelManager.setItemDirty(tag, true);
      syncManager.sync().then(callback);
      modelManager.resortTag(tag);
    }

    /*
    Notes Ctrl Callbacks
    */

    $scope.removeTag = function(tag) {
      if(confirm("Are you sure you want to delete this tag? Note: deleting a tag will not delete its notes.")) {
        modelManager.setItemToBeDeleted(tag);
        syncManager.sync().then(() => {
          // force scope tags to update on sub directives
          $rootScope.safeApply();
        });
      }
    }

    $scope.notesSelectionMade = function(note) {
      $scope.selectedNote = note;
    }

    $scope.notesAddNew = function(note) {
      modelManager.addItem(note);
      modelManager.setItemDirty(note);

      if(!$scope.selectedTag.isSmartTag()) {
        $scope.selectedTag.addItemAsRelationship(note);
        modelManager.setItemDirty($scope.selectedTag, true);
      }
    }

    /*
    Shared Callbacks
    */

    $rootScope.safeApply = function(fn) {
      var phase = this.$root.$$phase;
      if(phase == '$apply' || phase == '$digest')
        this.$eval(fn);
      else
        this.$apply(fn);
    };

    $rootScope.notifyDelete = function() {
      $timeout(function() {
        $rootScope.$broadcast("noteDeleted");
      }.bind(this), 0);
    }

    $scope.deleteNote = function(note) {
      modelManager.setItemToBeDeleted(note);

      if(note == $scope.selectedNote) {
        $scope.selectedNote = null;
      }

      if(note.dummy) {
        modelManager.removeItemLocally(note);
        $rootScope.notifyDelete();
        return;
      }

      syncManager.sync().then(() => {
        if(authManager.offline()) {
          // when deleting items while ofline, we need to explictly tell angular to refresh UI
          setTimeout(function () {
            $rootScope.notifyDelete();
            $rootScope.safeApply();
          }, 50);
        } else {
          $timeout(() => {
            $rootScope.notifyDelete();
          });
        }
      });
    }

    /*
      Disable dragging and dropping of files into main SN interface.
      both 'dragover' and 'drop' are required to prevent dropping of files.
      This will not prevent extensions from receiving drop events.
    */
    window.addEventListener('dragover', (event) => {
      event.preventDefault();
    }, false)

    window.addEventListener('drop', (event) => {
      event.preventDefault();
      alert("Please use FileSafe or the Bold Editor to attach images and files. Learn more at standardnotes.org/filesafe.")
    }, false)


    /*
      Handle Auto Sign In From URL
    */

    function urlParam(key) {
      return $location.search()[key];
    }

    async function autoSignInFromParams() {
      var server = urlParam("server");
      var email = urlParam("email");
      var pw = urlParam("pw");

      if(!authManager.offline()) {
        // check if current account
        if(await syncManager.getServerURL() === server && authManager.user.email === email) {
          // already signed in, return
          return;
        } else {
          // sign out
          authManager.signout(true).then(() => {
            window.location.reload();
          });
        }
      } else {
        authManager.login(server, email, pw, false, false, {}).then((response) => {
          window.location.reload();
        })
      }
    }

    if(urlParam("server")) {
      autoSignInFromParams();
    }
});
;class LockScreen {

  constructor() {
    this.restrict = "E";
    this.templateUrl = "lock-screen.html";
    this.scope = {
      onSuccess: "&",
    };
  }

  controller($scope, passcodeManager, authManager, syncManager, storageManager) {
    'ngInject';

    $scope.formData = {};

    this.visibilityObserver = passcodeManager.addVisibilityObserver((visible) => {
      if(visible) {
        let input = document.getElementById("passcode-input");
        if(input) {
          input.focus();
        }
      }
    })

    $scope.$on("$destroy", () => {
      passcodeManager.removeVisibilityObserver(this.visibilityObserver);
    });

    $scope.submitPasscodeForm = function() {
      if(!$scope.formData.passcode || $scope.formData.passcode.length == 0) {
        return;
      }
      passcodeManager.unlock($scope.formData.passcode, (success) => {
        if(!success) {
          alert("Invalid passcode. Please try again.");
          return;
        }

        $scope.onSuccess()();
      })
    }

    $scope.forgotPasscode = function() {
      $scope.formData.showRecovery = true;
    }

    $scope.beginDeleteData = function() {
      if(!confirm("Are you sure you want to clear all local data?")) {
        return;
      }

      authManager.signout(true).then(() => {
        window.location.reload();
      })
    }
  }
}

angular.module('app').directive('lockScreen', () => new LockScreen);
;angular.module('app')
  .directive("notesSection", function(){
    return {
      scope: {
        addNew: "&",
        selectionMade: "&",
        tag: "="
      },

      templateUrl: 'notes.html',
      replace: true,
      controller: 'NotesCtrl',
      controllerAs: 'ctrl',
      bindToController: true,

      link:function(scope, elem, attrs, ctrl) {
        scope.$watch('ctrl.tag', (tag, oldTag) => {
          if(tag) {
            ctrl.tagDidChange(tag, oldTag);
          }
        });
      }
    }
  })
  .controller('NotesCtrl', function (authManager, $timeout, $rootScope, modelManager,
    syncManager, storageManager, desktopManager, privilegesManager, keyboardManager) {

    this.panelController = {};
    this.searchSubmitted = false;

    $rootScope.$on("user-preferences-changed", () => {
      this.loadPreferences();
      this.reloadNotes();
    });

    authManager.addEventHandler((event) => {
      if(event == SFAuthManager.DidSignInEvent) {
        // Delete dummy note if applicable
        if(this.selectedNote && this.selectedNote.dummy) {
          modelManager.removeItemLocally(this.selectedNote);
          _.pull(this.notes, this.selectedNote);
          this.selectedNote = null;
          this.selectNote(null);

          // We now want to see if the user will download any items from the server.
          // If the next sync completes and our notes are still 0, we need to create a dummy.
          this.createDummyOnSynCompletionIfNoNotes = true;
        }
      }
    })

    syncManager.addEventHandler((syncEvent, data) => {
      if(syncEvent == "local-data-loaded") {
        if(this.notes.length == 0) {
          this.createNewNote();
        }
      } else if(syncEvent == "sync:completed") {
        // Pad with a timeout just to be extra patient
        $timeout(() => {
          if(this.createDummyOnSynCompletionIfNoNotes && this.notes.length == 0) {
            this.createDummyOnSynCompletionIfNoNotes = false;
            this.createNewNote();
          }
        }, 100)
      }
    });

    modelManager.addItemSyncObserver("note-list", "*", (allItems, validItems, deletedItems, source, sourceKey) => {
      // reload our notes
      this.reloadNotes();

      // Note has changed values, reset its flags
      let notes = allItems.filter((item) => item.content_type == "Note");
      for(let note of notes) {
        this.loadFlagsForNote(note);
        note.cachedCreatedAtString = note.createdAtString();
        note.cachedUpdatedAtString = note.updatedAtString();
      }

      // select first note if none is selected
      if(!this.selectedNote) {
        $timeout(() => {
          // required to be in timeout since selecting notes depends on rendered notes
          this.selectFirstNote();
        })
      }
    });

    this.setNotes = function(notes) {
      notes = this.filterNotes(notes);
      notes = this.sortNotes(notes, this.sortBy, this.sortReverse);
      for(let note of notes) {
        note.shouldShowTags = this.shouldShowTagsForNote(note);
      }
      this.notes = notes;

      this.reloadPanelTitle();
    }

    this.reloadNotes = function() {
      let notes = this.tag.notes;

      // Typically we reload flags via modelManager.addItemSyncObserver,
      // but sync observers are not notified of errored items, so we'll do it here instead
      for(let note of notes) {
        if(note.errorDecrypting) {
          this.loadFlagsForNote(note);
        }
      }

      this.setNotes(notes);
    }

    this.reorderNotes = function() {
      this.setNotes(this.notes);
    }

    this.loadPreferences = function() {
      let prevSortValue = this.sortBy;

      this.sortBy = authManager.getUserPrefValue("sortBy", "created_at");
      this.sortReverse = authManager.getUserPrefValue("sortReverse", false);

      if(this.sortBy == "updated_at") {
        // use client_updated_at instead
        this.sortBy = "client_updated_at";
      }

      if(prevSortValue && prevSortValue != this.sortBy) {
        $timeout(() => {
          this.selectFirstNote();
        })
      }

      this.showArchived = authManager.getUserPrefValue("showArchived", false);
      this.hidePinned = authManager.getUserPrefValue("hidePinned", false);
      this.hideNotePreview = authManager.getUserPrefValue("hideNotePreview", false);
      this.hideDate = authManager.getUserPrefValue("hideDate", false);
      this.hideTags = authManager.getUserPrefValue("hideTags", false);

      let width = authManager.getUserPrefValue("notesPanelWidth");
      if(width) {
        this.panelController.setWidth(width);
        if(this.panelController.isCollapsed()) {
          $rootScope.$broadcast("panel-resized", {panel: "notes", collapsed: this.panelController.isCollapsed()})
        }
      }
    }

    this.loadPreferences();

    this.onPanelResize = function(newWidth, lastLeft, isAtMaxWidth, isCollapsed) {
      authManager.setUserPrefValue("notesPanelWidth", newWidth);
      authManager.syncUserPreferences();
      $rootScope.$broadcast("panel-resized", {panel: "notes", collapsed: isCollapsed})
    }

    angular.element(document).ready(() => {
      this.loadPreferences();
    });

    $rootScope.$on("editorFocused", function(){
      this.showMenu = false;
    }.bind(this))

    $rootScope.$on("noteDeleted", function() {
      $timeout(this.onNoteRemoval.bind(this));
    }.bind(this))

    $rootScope.$on("noteArchived", function() {
      $timeout(this.onNoteRemoval.bind(this));
    }.bind(this));


    // When a note is removed from the list
    this.onNoteRemoval = function() {
      let visibleNotes = this.visibleNotes();
      let index;
      if(this.selectedIndex < visibleNotes.length) {
        index = Math.max(this.selectedIndex, 0);
      } else {
        index = visibleNotes.length - 1;
      }

      let note = visibleNotes[index];
      if(note) {
        this.selectNote(note);
      } else {
        this.createNewNote();
      }
    }

    window.onresize = (event) =>   {
      this.resetPagination({keepCurrentIfLarger: true});
    };

    this.paginate = function() {
      this.notesToDisplay += this.DefaultNotesToDisplayValue

      if (this.searchSubmitted) {
        desktopManager.searchText(this.noteFilter.text);
      }
    }

    this.resetPagination = function({keepCurrentIfLarger} = {}) {
      let MinNoteHeight = 51.0; // This is the height of a note cell with nothing but the title, which *is* a display option
      this.DefaultNotesToDisplayValue = (document.documentElement.clientHeight / MinNoteHeight) || 20;
      if(keepCurrentIfLarger && this.notesToDisplay > this.DefaultNotesToDisplayValue) {
        return;
      }
      this.notesToDisplay = this.DefaultNotesToDisplayValue;
    }

    this.resetPagination();

    this.reloadPanelTitle = function() {
      if(this.isFiltering()) {
        this.panelTitle = `${this.notes.filter((i) => {return i.visible;}).length} search results`;
      } else if(this.tag) {
        this.panelTitle = `${this.tag.title}`;
      }
    }

    this.optionsSubtitle = function() {
      var base = "";
      if(this.sortBy == "created_at") {
        base += " Date Added";
      } else if(this.sortBy == "client_updated_at") {
        base += " Date Modified";
      } else if(this.sortBy == "title") {
        base += " Title";
      }

      if(this.showArchived) {
        base += " | + Archived"
      }
      if(this.hidePinned) {
        base += " | – Pinned"
      }
      if(this.sortReverse) {
        base += " | Reversed"
      }

      return base;
    }

    this.loadFlagsForNote = (note) => {
      let flags = [];

      if(note.pinned) {
        flags.push({
          text: "Pinned",
          class: "info"
        })
      }

      if(note.archived) {
        flags.push({
          text: "Archived",
          class: "warning"
        })
      }

      if(note.content.protected) {
        flags.push({
          text: "Protected",
          class: "success"
        })
      }

      if(note.locked) {
        flags.push({
          text: "Locked",
          class: "neutral"
        })
      }

      if(note.content.trashed) {
        flags.push({
          text: "Deleted",
          class: "danger"
        })
      }

      if(note.content.conflict_of) {
        flags.push({
          text: "Conflicted Copy",
          class: "danger"
        })
      }

      if(note.errorDecrypting) {
        flags.push({
          text: "Missing Keys",
          class: "danger"
        })
      }

      if(note.deleted) {
        flags.push({
          text: "Deletion Pending Sync",
          class: "danger"
        })
      }

      note.flags = flags;

      return flags;
    }

    this.tagDidChange = function(tag, oldTag) {
      var scrollable = document.getElementById("notes-scrollable");
      if(scrollable) {
        scrollable.scrollTop = 0;
        scrollable.scrollLeft = 0;
      }

      this.resetPagination();

      this.showMenu = false;

      if(this.selectedNote) {
        if(this.selectedNote.dummy && oldTag) {
          _.remove(oldTag.notes, this.selectedNote);
        }
      }

      this.noteFilter.text = "";
      desktopManager.searchText();

      this.setNotes(tag.notes);

      // perform in timeout since visibleNotes relies on renderedNotes which relies on render to complete
      $timeout(() => {
        if(this.notes.length > 0) {
          this.notes.forEach((note) => { note.visible = true; })
          this.selectFirstNote();
        } else if(syncManager.initialDataLoaded()) {
          if(!tag.isSmartTag()) {
            this.createNewNote();
          } else {
            if(this.selectedNote && !this.notes.includes(this.selectedNote)) {
              this.selectNote(null);
            }
          }
        }
      })
    }

    this.visibleNotes = function() {
      return this.renderedNotes.filter(function(note){
        return note.visible;
      });
    }

    this.selectFirstNote = function() {
      var visibleNotes = this.visibleNotes();
      if(visibleNotes.length > 0) {
        this.selectNote(visibleNotes[0]);
      }
    }

    this.selectNextNote = function() {
      var visibleNotes = this.visibleNotes();
      let currentIndex = visibleNotes.indexOf(this.selectedNote);
      if(currentIndex + 1 < visibleNotes.length) {
        this.selectNote(visibleNotes[currentIndex + 1]);
      }
    }

    this.selectPreviousNote = function() {
      var visibleNotes = this.visibleNotes();
      let currentIndex = visibleNotes.indexOf(this.selectedNote);
      if(currentIndex - 1 >= 0) {
        this.selectNote(visibleNotes[currentIndex - 1]);
        return true;
      } else {
        return false;
      }
    }

    this.selectNote = async function(note, viaClick = false) {
      if(!note) {
        this.selectionMade()(null);
        return;
      }

      let run = () => {
        $timeout(() => {
          let dummyNote;
          if(this.selectedNote && this.selectedNote != note && this.selectedNote.dummy) {
            // remove dummy
            dummyNote = this.selectedNote;
          }

          this.selectedNote = note;
          if(note.content.conflict_of) {
            note.content.conflict_of = null; // clear conflict
            modelManager.setItemDirty(note, true);
            syncManager.sync();
          }
          this.selectionMade()(note);
          this.selectedIndex = Math.max(this.visibleNotes().indexOf(note), 0);

          // There needs to be a long timeout after setting selection before removing the dummy
          // Otherwise, you'll click a note, remove this one, and strangely, the click event registers for a lower cell
          if(dummyNote) {
            $timeout(() => {
              modelManager.removeItemLocally(dummyNote);
              _.pull(this.notes, dummyNote);
            }, 250)
          }

          if(viaClick && this.isFiltering()) {
            desktopManager.searchText(this.noteFilter.text);
          }
        })
      }

      if(note.content.protected && await privilegesManager.actionRequiresPrivilege(PrivilegesManager.ActionViewProtectedNotes)) {
        privilegesManager.presentPrivilegesModal(PrivilegesManager.ActionViewProtectedNotes, () => {
          run();
        });
      } else {
        run();
      }
    }

    this.isFiltering = function() {
      return this.noteFilter.text && this.noteFilter.text.length > 0;
    }

    this.createNewNote = function() {
      // The "Note X" counter is based off this.notes.length, but sometimes, what you see in the list is only a subset.
      // We can use this.visibleNotes().length, but that only accounts for non-paginated results, so first 15 or so.
      var title = "Note" + (this.notes ? (" " + (this.notes.length + 1)) : "");
      let newNote = modelManager.createItem({content_type: "Note", content: {text: "", title: title}});
      newNote.dummy = true;
      this.newNote = newNote;
      this.selectNote(this.newNote);
      this.addNew()(this.newNote);
    }

    this.noteFilter = {text : ''};

    this.onFilterEnter = function() {
      // For Desktop, performing a search right away causes input to lose focus.
      // We wait until user explicity hits enter before highlighting desktop search results.
      this.searchSubmitted = true;
      desktopManager.searchText(this.noteFilter.text);
    }

    this.clearFilterText = function() {
      this.noteFilter.text = '';
      this.onFilterEnter();
      this.filterTextChanged();

      // Reset loaded notes
      this.resetPagination();
    }

    this.filterTextChanged = function() {
      if(this.searchSubmitted) {
        this.searchSubmitted = false;
      }

      this.reloadNotes();

      $timeout(() => {
        if(!this.selectedNote.visible) {
          this.selectFirstNote();
        }
      }, 100)
    }

    this.selectedMenuItem = function() {
      this.showMenu = false;
    }

    this.togglePrefKey = function(key) {
      this[key] = !this[key];
      authManager.setUserPrefValue(key, this[key]);
      authManager.syncUserPreferences();
      this.reloadNotes();
    }

    this.selectedSortByCreated = function() {
      this.setSortBy("created_at");
    }

    this.selectedSortByUpdated = function() {
      this.setSortBy("client_updated_at");
    }

    this.selectedSortByTitle = function() {
      this.setSortBy("title");
    }

    this.toggleReverseSort = function() {
      this.selectedMenuItem();
      this.sortReverse = !this.sortReverse;
      this.reorderNotes();
      authManager.setUserPrefValue("sortReverse", this.sortReverse);
      authManager.syncUserPreferences();
    }

    this.setSortBy = function(type) {
      this.sortBy = type;
      this.reorderNotes();
      authManager.setUserPrefValue("sortBy", this.sortBy);
      authManager.syncUserPreferences();
    }

    this.shouldShowTagsForNote = function(note) {
      if(this.hideTags || note.content.protected) {
        return false;
      }

      if(this.tag.content.isAllTag) {
        return note.tags && note.tags.length > 0;
      }

      if(this.tag.isSmartTag()) {
        return true;
      }

      // Inside a tag, only show tags string if note contains tags other than this.tag
      return note.tags && note.tags.length > 1;
    }

    this.filterNotes = function(notes) {
      return notes.filter((note) => {
        let canShowArchived = this.showArchived, canShowPinned = !this.hidePinned;
        let isTrash = this.tag.content.isTrashTag;

        if(!isTrash && note.content.trashed) {
          note.visible = false;
          return note.visible;
        }

        var isSmartTag = this.tag.isSmartTag();
        if(isSmartTag) {
          canShowArchived = canShowArchived || this.tag.content.isArchiveTag || isTrash;
        }

        if((note.archived && !canShowArchived) || (note.pinned && !canShowPinned)) {
          note.visible = false;
          return note.visible;
        }

        var filterText = this.noteFilter.text.toLowerCase();
        if(filterText.length == 0) {
          note.visible = true;
        } else {
          var words = filterText.split(" ");
          var matchesTitle = words.every(function(word) { return  note.safeTitle().toLowerCase().indexOf(word) >= 0; });
          var matchesBody = words.every(function(word) { return  note.safeText().toLowerCase().indexOf(word) >= 0; });
          note.visible = matchesTitle || matchesBody;
        }

        return note.visible;
      });
    }

    this.sortNotes = function(items, sortBy, reverse) {
      let sortValueFn = (a, b, pinCheck = false) => {
        if(a.dummy) { return -1; }
        if(b.dummy) { return 1; }
        if(!pinCheck) {
          if(a.pinned && b.pinned) {
            return sortValueFn(a, b, true);
          }
          if(a.pinned) { return -1; }
          if(b.pinned) { return 1; }
        }

        var aValue = a[sortBy] || "";
        var bValue = b[sortBy] || "";

        let vector = 1;

        if(reverse) {
          vector *= -1;
        }

        if(sortBy == "title") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();

          if(aValue.length == 0 && bValue.length == 0) {
            return 0;
          } else if(aValue.length == 0 && bValue.length != 0) {
            return 1 * vector;
          } else if(aValue.length != 0 && bValue.length == 0) {
            return -1 * vector;
          } else  {
            vector *= -1;
          }
        }

        if(aValue > bValue) { return -1 * vector;}
        else if(aValue < bValue) { return 1 * vector;}
        return 0;
      }

      items = items || [];
      var result = items.sort(function(a, b){
        return sortValueFn(a, b);
      })
      return result;
    };


    /*
      Keyboard Shortcuts
    */

    // In the browser we're not allowed to override cmd/ctrl + n, so we have to use Control modifier as well.
    // These rules don't apply to desktop, but probably better to be consistent.
    this.newNoteKeyObserver = keyboardManager.addKeyObserver({
      key: "n",
      modifiers: [KeyboardManager.KeyModifierMeta, KeyboardManager.KeyModifierCtrl],
      onKeyDown: (event) => {
        event.preventDefault();
        $timeout(() => {
          this.createNewNote();
        });
      }
    })

    this.getSearchBar = function() {
      return document.getElementById("search-bar");
    }

    this.nextNoteKeyObserver = keyboardManager.addKeyObserver({
      key: KeyboardManager.KeyDown,
      elements: [document.body, this.getSearchBar()],
      onKeyDown: (event) => {
        let searchBar = this.getSearchBar();
        if(searchBar == document.activeElement) {
          searchBar.blur()
        }
        $timeout(() => {
          this.selectNextNote();
        });
      }
    })

    this.nextNoteKeyObserver = keyboardManager.addKeyObserver({
      key: KeyboardManager.KeyUp,
      element: document.body,
      onKeyDown: (event) => {
        $timeout(() => {
          this.selectPreviousNote();
        });
      }
    });

    this.searchKeyObserver = keyboardManager.addKeyObserver({
      key: "f",
      modifiers: [KeyboardManager.KeyModifierMeta, KeyboardManager.KeyModifierShift],
      onKeyDown: (event) => {
        let searchBar = this.getSearchBar();
        if(searchBar) {searchBar.focus()};
      }
    })

  });
;angular.module('app')
  .directive("tagsSection", function(){
    return {
      restrict: 'E',
      scope: {
        addNew: "&",
        selectionMade: "&",
        save: "&",
        removeTag: "&"
      },
      templateUrl: 'tags.html',
      replace: true,
      controller: 'TagsCtrl',
      controllerAs: 'ctrl',
      bindToController: true,
    }
  })
  .controller('TagsCtrl', function ($rootScope, modelManager, syncManager, $timeout, componentManager, authManager) {
    // Wrap in timeout so that selectTag is defined
    $timeout(() => {
      this.smartTags = modelManager.getSmartTags();
      this.selectTag(this.smartTags[0]);
    })

    syncManager.addEventHandler((syncEvent, data) => {
      if(syncEvent == "local-data-loaded"
        || syncEvent == "sync:completed"
        || syncEvent == "local-data-incremental-load") {
        this.tags = modelManager.tags;
        this.smartTags = modelManager.getSmartTags();
      }
    });

    modelManager.addItemSyncObserver("tags-list", "*", (allItems, validItems, deletedItems, source, sourceKey) => {
      this.reloadNoteCounts();
    });

    this.reloadNoteCounts = function() {
      let allTags = [];
      if(this.tags) { allTags = allTags.concat(this.tags);}
      if(this.smartTags) { allTags = allTags.concat(this.smartTags);}

      for(let tag of allTags) {
        var validNotes = SNNote.filterDummyNotes(tag.notes).filter((note) => {
          return !note.archived && !note.content.trashed;
        });

        tag.cachedNoteCount = validNotes.length;
      }
    }

    this.panelController = {};

    $rootScope.$on("user-preferences-changed", () => {
      this.loadPreferences();
    });

    this.loadPreferences = function() {
      let width = authManager.getUserPrefValue("tagsPanelWidth");
      if(width) {
        this.panelController.setWidth(width);
        if(this.panelController.isCollapsed()) {
          $rootScope.$broadcast("panel-resized", {panel: "tags", collapsed: this.panelController.isCollapsed()})
        }
      }
    }

    this.loadPreferences();

    this.onPanelResize = function(newWidth, lastLeft, isAtMaxWidth, isCollapsed) {
      authManager.setUserPrefValue("tagsPanelWidth", newWidth, true);
      $rootScope.$broadcast("panel-resized", {panel: "tags", collapsed: isCollapsed})
    }

    this.componentManager = componentManager;

    componentManager.registerHandler({identifier: "tags", areas: ["tags-list"], activationHandler: function(component){
      this.component = component;
    }.bind(this), contextRequestHandler: function(component){
      return null;
    }.bind(this), actionHandler: function(component, action, data){
      if(action === "select-item") {
        if(data.item.content_type == "Tag") {
          let tag = modelManager.findItem(data.item.uuid);
          if(tag) {
            this.selectTag(tag);
          }
        } else if(data.item.content_type == "SN|SmartTag") {
          let smartTag = new SNSmartTag(data.item);
          this.selectTag(smartTag);
        }
      } else if(action === "clear-selection") {
        this.selectTag(this.smartTags[0]);
      }
    }.bind(this)});

    this.selectTag = function(tag) {
      if(tag.isSmartTag()) {
        Object.defineProperty(tag, "notes", {
          get: () => {
            return modelManager.notesMatchingSmartTag(tag);
          }
        });
      }
      this.selectedTag = tag;
      if(tag.content.conflict_of) {
        tag.content.conflict_of = null;
        modelManager.setItemDirty(tag, true);
        syncManager.sync();
      }
      this.selectionMade()(tag);
    }

    this.clickedAddNewTag = function() {
      if(this.editingTag) {
        return;
      }

      this.newTag = modelManager.createItem({content_type: "Tag"});
      this.selectedTag = this.newTag;
      this.editingTag = this.newTag;
      this.addNew()(this.newTag);
    }

    this.tagTitleDidChange = function(tag) {
      this.editingTag = tag;
    }

    this.saveTag = function($event, tag) {
      this.editingTag = null;
      $event.target.blur();

      if(!tag.title || tag.title.length == 0) {
        if(originalTagName) {
          tag.title = originalTagName;
          originalTagName = null;
        } else {
          // newly created tag without content
          modelManager.removeItemLocally(tag);
        }
        return;
      }

      this.save()(tag, (savedTag) => {
        $timeout(() => {
          this.selectTag(tag);
          this.newTag = null;
        })
      });
    }

    function inputElementForTag(tag) {
      return document.getElementById("tag-" + tag.uuid);
    }

    var originalTagName = "";
    this.selectedRenameTag = function($event, tag) {
      originalTagName = tag.title;
      this.editingTag = tag;
      $timeout(function(){
        inputElementForTag(tag).focus();
      })
    }

    this.selectedDeleteTag = function(tag) {
      this.removeTag()(tag);
      this.selectTag(this.smartTags[0]);
    }
  });
;class ActionsManager {

  constructor(httpManager, modelManager, authManager, syncManager, $rootScope, $compile, $timeout) {
    this.httpManager = httpManager;
    this.modelManager = modelManager;
    this.authManager = authManager;
    this.syncManager = syncManager;
    this.$rootScope = $rootScope;
    this.$compile = $compile;
    this.$timeout = $timeout;

    // Used when decrypting old items with new keys. This array is only kept in memory.
    this.previousPasswords = [];
  }

  get extensions() {
    return this.modelManager.validItemsForContentType("Extension");
  }

  extensionsInContextOfItem(item) {
    return this.extensions.filter(function(ext){
      return _.includes(ext.supported_types, item.content_type) || ext.actionsWithContextForItem(item).length > 0;
    })
  }

  /*
  Loads an extension in the context of a certain item. The server then has the chance to respond with actions that are
  relevant just to this item. The response extension is not saved, just displayed as a one-time thing.
  */
  loadExtensionInContextOfItem(extension, item, callback) {
    this.httpManager.getAbsolute(extension.url, {content_type: item.content_type, item_uuid: item.uuid}, function(response){
      this.updateExtensionFromRemoteResponse(extension, response);
      callback && callback(extension);
    }.bind(this), function(response){
      console.log("Error loading extension", response);
      if(callback) {
        callback(null);
      }
    }.bind(this))
  }

  updateExtensionFromRemoteResponse(extension, response) {
    if(response.description) { extension.description = response.description; }
    if(response.supported_types) { extension.supported_types = response.supported_types; }

    if(response.actions) {
      extension.actions = response.actions.map(function(action){
        return new Action(action);
      })
    } else {
      extension.actions = [];
    }
  }

  async executeAction(action, extension, item, callback) {

    var customCallback = (response, error) => {
      action.running = false;
      this.$timeout(() => {
        callback(response, error);
      })
    }

    action.running = true;

    let decrypted = action.access_type == "decrypted";

    var triedPasswords = [];

    let handleResponseDecryption = async (response, keys, merge) => {
      var item = response.item;

      await SFJS.itemTransformer.decryptItem(item, keys);

      if(!item.errorDecrypting) {
        if(merge) {
          var items = await this.modelManager.mapResponseItemsToLocalModels([item], SFModelManager.MappingSourceRemoteActionRetrieved);
          for(var mappedItem of items) {
            this.modelManager.setItemDirty(mappedItem, true);
          }
          this.syncManager.sync();
          customCallback({item: item});
        } else {
          item = this.modelManager.createItem(item);
          customCallback({item: item});
        }
        return true;
      } else {
        // Error decrypting
        if(!response.auth_params) {
          // In some cases revisions were missing auth params. Instruct the user to email us to get this remedied.
          alert("We were unable to decrypt this revision using your current keys, and this revision is missing metadata that would allow us to try different keys to decrypt it. This can likely be fixed with some manual intervention. Please email hello@standardnotes.org for assistance.");
          return;
        }

        // Try previous passwords
        for(let passwordCandidate of this.previousPasswords) {
          if(triedPasswords.includes(passwordCandidate)) {
            continue;
          }
          triedPasswords.push(passwordCandidate);

          var keyResults = await SFJS.crypto.computeEncryptionKeysForUser(passwordCandidate, response.auth_params);
          if(!keyResults) {
            continue;
          }

          var success = await handleResponseDecryption(response, keyResults, merge);
          if(success) {
            return true;
          }
        }

        this.presentPasswordModal((password) => {
          this.previousPasswords.push(password);
          handleResponseDecryption(response, keys, merge);
        });

        return false;
      }
    }

    switch (action.verb) {
      case "get": {
        if(confirm("Are you sure you want to replace the current note contents with this action's results?")) {
          this.httpManager.getAbsolute(action.url, {}, async (response) => {
            action.error = false;
            handleResponseDecryption(response, await this.authManager.keys(), true);
          }, (response) => {
            let error = (response && response.error) || {message: "An issue occurred while processing this action. Please try again."}
            alert(error.message);
            action.error = true;
            customCallback(null, error);
          })
        }
        break;
      }

      case "render": {
        this.httpManager.getAbsolute(action.url, {}, async (response) => {
          action.error = false;
          handleResponseDecryption(response, await this.authManager.keys(), false);
        }, (response) => {
          let error = (response && response.error) || {message: "An issue occurred while processing this action. Please try again."}
          alert(error.message);
          action.error = true;
          customCallback(null, error);
        })

        break;
      }

      case "show": {
        let win = window.open(action.url, '_blank');
        if(win) {
          win.focus();
        }
        customCallback();
        break;
      }

      case "post": {
        this.outgoingParamsForItem(item, extension, decrypted).then((itemParams) => {
          var params = {
            items: [itemParams] // Wrap it in an array
          }

          this.performPost(action, extension, params, (response) => {
            if(response && response.error) {
              alert("An issue occurred while processing this action. Please try again.");
            }
            customCallback(response);
          });
        })

        break;
      }

      default: {

      }
    }

    action.lastExecuted = new Date();
  }

  async outgoingParamsForItem(item, extension, decrypted = false) {
    var keys = await this.authManager.keys();
    if(decrypted) {
      keys = null;
    }
    var itemParams = new SFItemParams(item, keys, await this.authManager.getAuthParams());
    return itemParams.paramsForExtension();
  }

  performPost(action, extension, params, callback) {
    this.httpManager.postAbsolute(action.url, params, function(response){
      action.error = false;
      if(callback) {
        callback(response);
      }
    }.bind(this), function(response){
      action.error = true;
      console.log("Action error response:", response);
      if(callback) {
        callback({error: "Request error"});
      }
    })
  }

  presentRevisionPreviewModal(uuid, content) {
    var scope = this.$rootScope.$new(true);
    scope.uuid = uuid;
    scope.content = content;
    var el = this.$compile( "<revision-preview-modal uuid='uuid' content='content' class='sk-modal'></revision-preview-modal>" )(scope);
    angular.element(document.body).append(el);
  }

  presentPasswordModal(callback) {
    var scope = this.$rootScope.$new(true);
    scope.type = "password";
    scope.title = "Decryption Assistance";
    scope.message = "Unable to decrypt this item with your current keys. Please enter your account password at the time of this revision.";
    scope.callback = callback;
    var el = this.$compile( "<input-modal type='type' message='message' title='title' callback='callback'></input-modal>" )(scope);
    angular.element(document.body).append(el);
  }

}

angular.module('app').service('actionsManager', ActionsManager);
;class ArchiveManager {

  constructor(passcodeManager, authManager, modelManager, privilegesManager) {
    this.passcodeManager = passcodeManager;
    this.authManager = authManager;
    this.modelManager = modelManager;
    this.privilegesManager = privilegesManager;
  }

  /*
  Public
  */

  async downloadBackup(encrypted) {
    return this.downloadBackupOfItems(this.modelManager.allItems, encrypted);
  }

  async downloadBackupOfItems(items, encrypted) {
    let run = async () => {
      // download in Standard File format
      var keys, authParams;
      if(encrypted) {
        if(this.authManager.offline() && this.passcodeManager.hasPasscode()) {
          keys = this.passcodeManager.keys();
          authParams = this.passcodeManager.passcodeAuthParams();
        } else {
          keys = await this.authManager.keys();
          authParams = await this.authManager.getAuthParams();
        }
      }
      this.__itemsData(items, keys, authParams).then((data) => {
        let modifier = encrypted ? "Encrypted" : "Decrypted";
        this.__downloadData(data, `Standard Notes ${modifier} Backup - ${this.__formattedDate()}.txt`);

        // download as zipped plain text files
        if(!keys) {
          this.__downloadZippedItems(items);
        }
      })
    }

    if(await this.privilegesManager.actionRequiresPrivilege(PrivilegesManager.ActionManageBackups)) {
      this.privilegesManager.presentPrivilegesModal(PrivilegesManager.ActionManageBackups, () => {
        run();
      });
    } else {
      run();
    }
  }

  /*
  Private
  */

  __formattedDate() {
    var string = `${new Date()}`;
    // Match up to the first parenthesis, i.e do not include '(Central Standard Time)'
    var matches = string.match(/^(.*?) \(/);
    if(matches.length >= 2) {
      return matches[1]
    }
    return string;
  }

  async __itemsData(items, keys, authParams) {
    let data = await this.modelManager.getJSONDataForItems(items, keys, authParams);
    let blobData = new Blob([data], {type: 'text/json'});
    return blobData;
  }

  __loadZip(callback) {
    if(window.zip) {
      callback();
      return;
    }

    var scriptTag = document.createElement('script');
    scriptTag.src = "/assets/zip/zip.js";
    scriptTag.async = false;
    var headTag = document.getElementsByTagName('head')[0];
    headTag.appendChild(scriptTag);
    scriptTag.onload = function() {
      zip.workerScriptsPath = "assets/zip/";
      callback();
    }
  }

  __downloadZippedItems(items) {
    this.__loadZip(() => {
      zip.createWriter(new zip.BlobWriter("application/zip"), (zipWriter) => {
        var index = 0;

        let nextFile = () => {
          var item = items[index];
          var name, contents;

          if(item.content_type == "Note") {
            name = item.content.title;
            contents = item.content.text;
          } else {
            name = item.content_type;
            contents = JSON.stringify(item.content, null, 2);
          }

          if(!name) {
            name = "";
          }

          var blob = new Blob([contents], {type: 'text/plain'});

          var filePrefix = name.replace(/\//g, "").replace(/\\+/g, "");
          var fileSuffix = `-${item.uuid.split("-")[0]}.txt`

          // Standard max filename length is 255. Slice the note name down to allow filenameEnd
          filePrefix = filePrefix.slice(0, (255 - fileSuffix.length));

          let fileName = `${item.content_type}/${filePrefix}${fileSuffix}`

          zipWriter.add(fileName, new zip.BlobReader(blob), () => {
            index++;
            if(index < items.length) {
              nextFile();
            } else {
              zipWriter.close((blob) => {
                this.__downloadData(blob, `Standard Notes Backup - ${this.__formattedDate()}.zip`);
                zipWriter = null;
              });
            }
          });
        }

        nextFile();
      }, onerror);
    })
  }


  __hrefForData(data) {
    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (this.textFile !== null) {
      window.URL.revokeObjectURL(this.textFile);
    }

    this.textFile = window.URL.createObjectURL(data);

    // returns a URL you can use as a href
    return this.textFile;
  }

  __downloadData(data, fileName) {
    var link = document.createElement('a');
    link.setAttribute('download', fileName);
    link.href = this.__hrefForData(data);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }


}

angular.module('app').service('archiveManager', ArchiveManager);
;class AuthManager extends SFAuthManager {

  constructor(modelManager, singletonManager, storageManager, dbManager, httpManager, $rootScope, $timeout, $compile) {
    super(storageManager, httpManager, null, $timeout);
    this.$rootScope = $rootScope;
    this.$compile = $compile;
    this.modelManager = modelManager;
    this.singletonManager = singletonManager;
    this.storageManager = storageManager;
    this.dbManager = dbManager;
  }

  loadInitialData() {
    var userData = this.storageManager.getItemSync("user");
    if(userData) {
      this.user = JSON.parse(userData);
    } else {
      // legacy, check for uuid
      var idData = this.storageManager.getItemSync("uuid");
      if(idData) {
        this.user = {uuid: idData};
      }
    }

    this.configureUserPrefs();
    this.checkForSecurityUpdate();

    this.modelManager.addItemSyncObserver("user-prefs", "SN|UserPreferences", (allItems, validItems, deletedItems, source, sourceKey) => {
      this.userPreferencesDidChange();
    });

  }

  offline() {
    return !this.user;
  }

  isEphemeralSession() {
    if(this.ephemeral == null || this.ephemeral == undefined) {
      this.ephemeral = JSON.parse(this.storageManager.getItemSync("ephemeral", StorageManager.Fixed));
    }
    return this.ephemeral;
  }

  setEphemeral(ephemeral) {
    this.ephemeral = ephemeral;
    if(ephemeral) {
      this.storageManager.setModelStorageMode(StorageManager.Ephemeral);
      this.storageManager.setItemsMode(StorageManager.Ephemeral);
    } else {
      this.storageManager.setModelStorageMode(StorageManager.Fixed);
      this.storageManager.setItemsMode(this.storageManager.bestStorageMode());
      this.storageManager.setItem("ephemeral", JSON.stringify(false), StorageManager.Fixed);
    }
  }

  async getAuthParamsForEmail(url, email, extraParams) {
    return super.getAuthParamsForEmail(url, email, extraParams);
  }

  async login(url, email, password, ephemeral, strictSignin, extraParams) {
    return super.login(url, email, password, strictSignin, extraParams).then((response) => {
      if(!response.error) {
        this.setEphemeral(ephemeral);
        this.checkForSecurityUpdate();
      }

      return response;
    })
  }

  async register(url, email, password, ephemeral) {
    return super.register(url, email, password).then((response) => {
      if(!response.error) {
        this.setEphemeral(ephemeral);
      }
      return response;
    })
  }

  async changePassword(url, email, current_server_pw, newKeys, newAuthParams) {
    return super.changePassword(url, email, current_server_pw, newKeys, newAuthParams).then((response) => {
      if(!response.error) {
        this.checkForSecurityUpdate();
      }
      return response;
    })
  }

  async handleAuthResponse(response, email, url, authParams, keys) {
    try {
      await super.handleAuthResponse(response, email, url, authParams, keys);
      this.user = response.user;
      this.storageManager.setItem("user", JSON.stringify(response.user));
    } catch (e) {
      this.dbManager.displayOfflineAlert();
    }
  }

  async verifyAccountPassword(password) {
    let authParams = await this.getAuthParams();
    let keys = await SFJS.crypto.computeEncryptionKeysForUser(password, authParams);
    let success = keys.mk === (await this.keys()).mk;
    return success;
  }

  async checkForSecurityUpdate() {
    if(this.offline()) {
      return false;
    }

    let latest = SFJS.version();
    let updateAvailable = await this.protocolVersion() !== latest;
    if(updateAvailable !== this.securityUpdateAvailable) {
      this.securityUpdateAvailable = updateAvailable;
      this.$rootScope.$broadcast("security-update-status-changed");
    }

    return this.securityUpdateAvailable;
  }

  presentPasswordWizard(type) {
    var scope = this.$rootScope.$new(true);
    scope.type = type;
    var el = this.$compile( "<password-wizard type='type'></password-wizard>" )(scope);
    angular.element(document.body).append(el);
  }

  signOut() {
    super.signout();
    this.user = null;
    this._authParams = null;
  }


  /* User Preferences */

  configureUserPrefs() {
    let prefsContentType = "SN|UserPreferences";

    let contentTypePredicate = new SFPredicate("content_type", "=", prefsContentType);
    this.singletonManager.registerSingleton([contentTypePredicate], (resolvedSingleton) => {
      this.userPreferences = resolvedSingleton;
    }, (valueCallback) => {
      // Safe to create. Create and return object.
      var prefs = new SFItem({content_type: prefsContentType});
      this.modelManager.addItem(prefs);
      this.modelManager.setItemDirty(prefs, true);
      this.$rootScope.sync();
      valueCallback(prefs);
    });
  }

  userPreferencesDidChange() {
    this.$rootScope.$broadcast("user-preferences-changed");
  }

  syncUserPreferences() {
    if(this.userPreferences) {
      this.modelManager.setItemDirty(this.userPreferences, true);
      this.$rootScope.sync();
    }
  }

  getUserPrefValue(key, defaultValue) {
    if(!this.userPreferences) { return defaultValue; }
    var value = this.userPreferences.getAppDataItem(key);
    return (value !== undefined && value != null) ? value : defaultValue;
  }

  setUserPrefValue(key, value, sync) {
    if(!this.userPreferences) { console.log("Prefs are null, not setting value", key); return; }
    this.userPreferences.setAppDataItem(key, value);
    if(sync) {
      this.syncUserPreferences();
    }
  }
}

angular.module('app').service('authManager', AuthManager);
;class ComponentManager extends SNComponentManager {
  constructor(modelManager, syncManager, desktopManager, nativeExtManager, $rootScope, $timeout, $compile) {
    super({
      modelManager,
      syncManager,
      desktopManager,
      nativeExtManager,
      alertManager: new SFAlertManager(),
      $uiRunner: $rootScope.safeApply,
      $timeout: $timeout,
      environment: isDesktopApplication() ? "desktop" : "web",
      platform: getPlatformString()
    });

    // this.loggingEnabled = true;

    this.$compile = $compile;
    this.$rootScope = $rootScope;
  }

  openModalComponent(component) {
    var scope = this.$rootScope.$new(true);
    scope.component = component;
    var el = this.$compile( "<component-modal component='component' class='sk-modal'></component-modal>" )(scope);
    angular.element(document.body).append(el);
  }

  presentPermissionsDialog(dialog) {
    let scope = this.$rootScope.$new(true);
    scope.permissionsString = dialog.permissionsString;
    scope.component = dialog.component;
    scope.callback = dialog.callback;

    var el = this.$compile( "<permissions-modal component='component' permissions-string='permissionsString' callback='callback' class='sk-modal'></permissions-modal>" )(scope);
    angular.element(document.body).append(el);
  }
}

angular.module('app').service('componentManager', ComponentManager);
;class DBManager {

  constructor() {
    this.locked = true;
  }

  displayOfflineAlert() {
    var message = "There was an issue loading your offline database. This could happen for two reasons:";
    message += "\n\n1. You're in a private window in your browser. We can't save your data without access to the local database. Please use a non-private window.";
    message += "\n\n2. You have two windows of the app open at the same time. Please close any other app instances and reload the page.";
    alert(message);
  }

  setLocked(locked) {
    this.locked = locked;
  }

  openDatabase(callback, onUgradeNeeded) {
    if(this.locked) {
      return;
    }

    var request = window.indexedDB.open("standardnotes", 1);

    request.onerror = function(event) {
      if(event.target.errorCode) {
        alert("Offline database issue: " + event.target.errorCode);
      } else {
        this.displayOfflineAlert();
      }
      console.error("Offline database issue:", event);
      if(callback) {
        callback(null);
      }
    }.bind(this);

    request.onsuccess = (event) => {
      var db = event.target.result;
      db.onversionchange = function(event) {
        db.close();
      };
      db.onerror = function(errorEvent) {
        console.log("Database error: " + errorEvent.target.errorCode);
      }
      if(callback) {
        callback(db);
      }
    };

    request.onblocked = (event) => {
      console.error("Request blocked error:", event.target.errorCode);
    }

    request.onupgradeneeded = (event) => {
      var db = event.target.result;

      db.onversionchange = function(event) {
        db.close();
      };

      // Create an objectStore for this database
      var objectStore = db.createObjectStore("items", { keyPath: "uuid" });
      objectStore.createIndex("title", "title", { unique: false });
      objectStore.createIndex("uuid", "uuid", { unique: true });
      objectStore.transaction.oncomplete = function(event) {
        // Ready to store values in the newly created objectStore.
        if(db.version === 1) {
          if(onUgradeNeeded) {
            onUgradeNeeded();
          }
        }
      };
    };
  }

  getAllModels(callback) {
    this.openDatabase((db) => {
      var objectStore = db.transaction("items").objectStore("items");
      var items = [];
      objectStore.openCursor().onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
          items.push(cursor.value);
          cursor.continue();
        }
        else {
          callback(items);
        }
      };
    }, null)
  }

  saveModel(item) {
    this.saveModels([item]);
  }

  saveModels(items, onsuccess, onerror) {

    if(items.length == 0) {
      if(onsuccess) {
        onsuccess();
      }
      return;
    }

    this.openDatabase((db) => {
      var transaction = db.transaction("items", "readwrite");
      transaction.oncomplete = function(event) {

      };

      transaction.onerror = function(event) {
        console.error("Transaction error:", event.target.errorCode);
      };

      transaction.onblocked = function(event) {
        console.error("Transaction blocked error:", event.target.errorCode);
      };

      transaction.onabort = function(event) {
        console.log("Offline saving aborted:", event);
        var error = event.target.error;
        if(error.name == "QuotaExceededError") {
          alert("Unable to save changes locally because your device is out of space. Please free up some disk space and try again, otherwise, your data may end up in an inconsistent state.");
        } else {
          alert(`Unable to save changes locally due to an unknown system issue. Issue Code: ${error.code} Issue Name: ${error.name}.`);
        }
        onerror && onerror(error);
      };

      var itemObjectStore = transaction.objectStore("items");
      var i = 0;
      putNext();

      function putNext() {
        if (i < items.length) {
          var item = items[i];
          var request = itemObjectStore.put(item);
          request.onerror = (event) => {
            console.error("DB put error:", event.target.error);
          }
          request.onsuccess = putNext;
          ++i;
        } else {
          onsuccess && onsuccess();
        }
      }
    }, null)
  }

  deleteModel(item, callback) {
    this.openDatabase((db) => {
      var request = db.transaction("items", "readwrite").objectStore("items").delete(item.uuid);
      request.onsuccess = function(event) {
        if(callback) {
          callback(true);
        }
      };
    }, null)
  }

  clearAllModels(callback) {
    var deleteRequest = window.indexedDB.deleteDatabase("standardnotes");

    deleteRequest.onerror = function(event) {
      console.log("Error deleting database.");
      callback && callback();
    };

    deleteRequest.onsuccess = function(event) {
      console.log("Database deleted successfully");
      callback && callback();
    };

    deleteRequest.onblocked = function(event) {
      console.error("Delete request blocked");
      alert("Your browser is blocking Standard Notes from deleting the local database. Make sure there are no other open windows of this app and try again. If the issue persists, please manually delete app data to sign out.")
    };
  }
}

angular.module('app').service('dbManager', DBManager);
;// An interface used by the Desktop app to interact with SN

class DesktopManager {

  constructor($rootScope, $timeout, modelManager, syncManager, authManager, passcodeManager) {
    this.passcodeManager = passcodeManager;
    this.modelManager = modelManager;
    this.authManager = authManager;
    this.syncManager = syncManager;
    this.$rootScope = $rootScope;
    this.timeout = $timeout;
    this.updateObservers = [];
    this.componentActivationObservers = [];

    this.isDesktop = isDesktopApplication();

    $rootScope.$on("initial-data-loaded", () => {
      this.dataLoaded = true;
      if(this.dataLoadHandler) {
        this.dataLoadHandler();
      }
    });

    $rootScope.$on("major-data-change", () => {
      if(this.majorDataChangeHandler) {
        this.majorDataChangeHandler();
      }
    })
  }

  saveBackup() {
    this.majorDataChangeHandler && this.majorDataChangeHandler();
  }

  getApplicationDataPath() {
    console.assert(this.applicationDataPath, "applicationDataPath is null");
    return this.applicationDataPath;
  }

  /*
    Sending a component in its raw state is really slow for the desktop app
    Keys are not passed into ItemParams, so the result is not encrypted
   */
  async convertComponentForTransmission(component) {
    return new SFItemParams(component).paramsForExportFile(true);
  }

  // All `components` should be installed
  syncComponentsInstallation(components) {
    if(!this.isDesktop) return;

    Promise.all(components.map((component) => {
      return this.convertComponentForTransmission(component);
    })).then((data) => {
      this.installationSyncHandler(data);
    })
  }

  async installComponent(component) {
    this.installComponentHandler(await this.convertComponentForTransmission(component));
  }

  registerUpdateObserver(callback) {
    var observer = {id: Math.random, callback: callback};
    this.updateObservers.push(observer);
    return observer;
  }

  searchText(text) {
    if(!this.isDesktop) {
      return;
    }
    this.lastSearchedText = text;
    this.searchHandler(text);
  }

  redoSearch()  {
    if(this.lastSearchedText) {
      this.searchText(this.lastSearchedText);
    }
  }


  deregisterUpdateObserver(observer) {
    _.pull(this.updateObservers, observer);
  }

  // Pass null to cancel search
  desktop_setSearchHandler(handler) {
    this.searchHandler = handler;
  }

  desktop_windowGainedFocus() {
    this.$rootScope.$broadcast("window-gained-focus");
  }

  desktop_windowLostFocus() {
    this.$rootScope.$broadcast("window-lost-focus");
  }

  desktop_onComponentInstallationComplete(componentData, error) {
    // console.log("Web|Component Installation/Update Complete", componentData, error);

    // Desktop is only allowed to change these keys:
    let permissableKeys = ["package_info", "local_url"];
    var component = this.modelManager.findItem(componentData.uuid);

    if(!component) {
      console.error("desktop_onComponentInstallationComplete component is null for uuid", componentData.uuid);
      return;
    }

    if(error) {
      component.setAppDataItem("installError", error);
    } else {
      for(var key of permissableKeys) {
        component[key] = componentData.content[key];
      }
      this.modelManager.notifySyncObserversOfModels([component], SFModelManager.MappingSourceDesktopInstalled);
      component.setAppDataItem("installError", null);
    }

    this.modelManager.setItemDirty(component, true);
    this.syncManager.sync();

    this.timeout(() => {
      for(var observer of this.updateObservers) {
        observer.callback(component);
      }
    });
  }

  desktop_registerComponentActivationObserver(callback) {
    var observer = {id: Math.random, callback: callback};
    this.componentActivationObservers.push(observer);
    return observer;
  }

  desktop_deregisterComponentActivationObserver(observer) {
    _.pull(this.componentActivationObservers, observer);
  }

  /* Notify observers that a component has been registered/activated */
  async notifyComponentActivation(component) {
    var serializedComponent = await this.convertComponentForTransmission(component);

    this.timeout(() => {
      for(var observer of this.componentActivationObservers) {
        observer.callback(serializedComponent);
      }
    });
  }

  /* Used to resolve "sn://" */
  desktop_setApplicationDataPath(path) {
    this.applicationDataPath = path;
  }

  desktop_setComponentInstallationSyncHandler(handler) {
    this.installationSyncHandler = handler;
  }

  desktop_setInstallComponentHandler(handler) {
    this.installComponentHandler = handler;
  }

  desktop_setInitialDataLoadHandler(handler) {
    this.dataLoadHandler = handler;
    if(this.dataLoaded) {
      this.dataLoadHandler();
    }
  }

  async desktop_requestBackupFile(callback) {
    var keys, authParams;
    if(this.authManager.offline() && this.passcodeManager.hasPasscode()) {
      keys = this.passcodeManager.keys();
      authParams = this.passcodeManager.passcodeAuthParams();
    } else {
      keys = await this.authManager.keys();
      authParams = await this.authManager.getAuthParams();
    }

    this.modelManager.getAllItemsJSONData(
      keys,
      authParams,
      true /* return null on empty */
    ).then((data) => {
      callback(data);
    })
  }

  desktop_setMajorDataChangeHandler(handler) {
    this.majorDataChangeHandler = handler;
  }

  desktop_didBeginBackup() {
    this.$rootScope.$broadcast("did-begin-local-backup");
  }

  desktop_didFinishBackup(success) {
    this.$rootScope.$broadcast("did-finish-local-backup", {success: success});
  }
}

angular.module('app').service('desktopManager', DesktopManager);
;class HttpManager extends SFHttpManager {

  constructor(storageManager, $timeout) {
    // calling callbacks in a $timeout allows UI to update
    super($timeout);

    this.setJWTRequestHandler(async () => {
      return storageManager.getItem("jwt");
    })
  }
}

angular.module('app').service('httpManager', HttpManager);
;class KeyboardManager {

  constructor() {
    this.observers = [];

    KeyboardManager.KeyTab = "Tab";
    KeyboardManager.KeyBackspace = "Backspace";
    KeyboardManager.KeyUp = "ArrowUp";
    KeyboardManager.KeyDown = "ArrowDown";

    KeyboardManager.KeyModifierShift = "Shift";
    KeyboardManager.KeyModifierCtrl = "Control";
    // ⌘ key on Mac, ⊞ key on Windows
    KeyboardManager.KeyModifierMeta = "Meta";
    KeyboardManager.KeyModifierAlt = "Alt";

    KeyboardManager.KeyEventDown = "KeyEventDown";
    KeyboardManager.KeyEventUp = "KeyEventUp";

    KeyboardManager.AllModifiers = [
      KeyboardManager.KeyModifierShift,
      KeyboardManager.KeyModifierCtrl,
      KeyboardManager.KeyModifierMeta,
      KeyboardManager.KeyModifierAlt
    ]

    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  modifiersForEvent(event) {
    let eventModifiers = KeyboardManager.AllModifiers.filter((modifier) => {
      // For a modifier like ctrlKey, must check both event.ctrlKey and event.key.
      // That's because on keyup, event.ctrlKey would be false, but event.key == Control would be true.
      let matches = (
        ((event.ctrlKey || event.key == KeyboardManager.KeyModifierCtrl) && modifier === KeyboardManager.KeyModifierCtrl) ||
        ((event.metaKey || event.key == KeyboardManager.KeyModifierMeta) && modifier === KeyboardManager.KeyModifierMeta) ||
        ((event.altKey || event.key == KeyboardManager.KeyModifierAlt) && modifier === KeyboardManager.KeyModifierAlt) ||
        ((event.shiftKey || event.key == KeyboardManager.KeyModifierShift) && modifier === KeyboardManager.KeyModifierShift)
      )

      return matches;
    })

    return eventModifiers;
  }

  eventMatchesKeyAndModifiers(event, key, modifiers = [])  {
    let eventModifiers = this.modifiersForEvent(event);

    if(eventModifiers.length != modifiers.length) {
      return false;
    }

    for(let modifier of modifiers) {
      if(!eventModifiers.includes(modifier)) {
        return false;
      }
    }

    // Modifers match, check key
    if(!key) {
      return true;
    }

    // In the browser, shift + f results in key 'f', but in Electron, shift + f results in 'F'
    // In our case we don't differentiate between the two.
    return key.toLowerCase() == event.key.toLowerCase();
  }

  notifyObserver(event, keyEventType) {
    for(let observer of this.observers) {
      if(observer.element && event.target != observer.element) {
        continue;
      }

      if(observer.elements && !observer.elements.includes(event.target)) {
        continue;
      }

      if(observer.notElement && observer.notElement == event.target) {
        continue;
      }

      if(observer.notElementIds && observer.notElementIds.includes(event.target.id)) {
        continue;
      }

      if(this.eventMatchesKeyAndModifiers(event, observer.key, observer.modifiers)) {
        let callback = keyEventType == KeyboardManager.KeyEventDown ? observer.onKeyDown : observer.onKeyUp;
        if(callback) {
          callback(event);
        }
      }
    }
  }

  handleKeyDown(event) {
    this.notifyObserver(event, KeyboardManager.KeyEventDown);
  }

  handleKeyUp(event) {
    this.notifyObserver(event, KeyboardManager.KeyEventUp);
  }

  addKeyObserver({key, modifiers, onKeyDown, onKeyUp, element, elements, notElement, notElementIds}) {
    let observer = {key, modifiers, onKeyDown, onKeyUp, element, elements, notElement, notElementIds};
    this.observers.push(observer);
    return observer;
  }

  removeKeyObserver(observer) {
    this.observers.splice(this.observers.indexOf(observer), 1);
  }
}

angular.module('app').service('keyboardManager', KeyboardManager);
;class MigrationManager extends SFMigrationManager {

  constructor($rootScope, modelManager, syncManager, componentManager, storageManager, statusManager, authManager, desktopManager) {
    super(modelManager, syncManager, storageManager, authManager);
    this.componentManager = componentManager;
    this.statusManager = statusManager;
    this.desktopManager = desktopManager;
  }

  registeredMigrations() {
    return [
      this.editorToComponentMigration(),
      this.componentUrlToHostedUrl(),
      this.removeTagReferencesFromNotes()
    ];
  }

  /*
  Migrate SN|Editor to SN|Component. Editors are deprecated as of November 2017. Editors using old APIs must
  convert to using the new component API.
  */

  editorToComponentMigration() {
    return {
      name: "editor-to-component",
      content_type: "SN|Editor",
      handler: async (editors) => {
        // Convert editors to components
        for(var editor of editors) {
          // If there's already a component for this url, then skip this editor
          if(editor.url && !this.componentManager.componentForUrl(editor.url)) {
            var component = this.modelManager.createItem({
              content_type: "SN|Component",
              content: {
                url: editor.url,
                name: editor.name,
                area: "editor-editor"
              }
            })
            component.setAppDataItem("data", editor.data);
            this.modelManager.addItem(component);
            this.modelManager.setItemDirty(component, true);
          }
        }

        for(let editor of editors) {
          this.modelManager.setItemToBeDeleted(editor);
        }

        this.syncManager.sync();
      }
    }
  }

  /*
  Migrate component.url fields to component.hosted_url. This involves rewriting any note data that relied on the
  component.url value to store clientData, such as the CodeEditor, which stores the programming language for the note
  in the note's clientData[component.url]. We want to rewrite any matching items to transfer that clientData into
  clientData[component.uuid].

  April 3, 2019 note: it seems this migration is mis-named. The first part of the description doesn't match what the code is actually doing.
  It has nothing to do with url/hosted_url relationship and more to do with just mapping client data from the note's hosted_url to its uuid

  Created: July 6, 2018
  */
  componentUrlToHostedUrl() {
    return {
      name: "component-url-to-hosted-url",
      content_type: "SN|Component",
      handler: async (components) => {
        let hasChanges = false;
        let notes = this.modelManager.validItemsForContentType("Note");
        for(let note of notes) {
          for(let component of components) {
            let clientData = note.getDomainDataItem(component.hosted_url, ComponentManager.ClientDataDomain);
            if(clientData) {
              note.setDomainDataItem(component.uuid, clientData, ComponentManager.ClientDataDomain);
              note.setDomainDataItem(component.hosted_url, null, ComponentManager.ClientDataDomain);
              this.modelManager.setItemDirty(note, true);
              hasChanges = true;
            }
          }
        }

        if(hasChanges) {
          this.syncManager.sync();
        }
      }
    }
  }



  /*
  Migrate notes which have relationships on tags to migrate those relationships to the tags themselves.
  That is, notes.content.references should not include any mention of tags.
  This will apply to notes created before the schema change. Now, only tags reference notes.
  Created: April 3, 2019
  */
  removeTagReferencesFromNotes() {
    return {
      name: "remove-tag-references-from-notes",
      content_type: "Note",
      handler: async (notes) => {

        let needsSync = false;
        let status = this.statusManager.addStatusFromString("Optimizing data...");
        let dirtyCount = 0;

        for(let note of notes) {
          if(!note.content) {
            continue;
          }

          let references = note.content.references;
          // Remove any tag references, and transfer them to the tag if neccessary.
          let newReferences = [];

          for(let reference of references)  {
            if(reference.content_type != "Tag") {
              newReferences.push(reference);
              continue;
            }

            // is Tag content_type, we will not be adding this to newReferences
            let tag = this.modelManager.findItem(reference.uuid);
            if(tag && !tag.hasRelationshipWithItem(note)) {
              tag.addItemAsRelationship(note);
              this.modelManager.setItemDirty(tag, true);
              dirtyCount++;
            }
          }

          if(newReferences.length != references.length) {
            note.content.references = newReferences;
            this.modelManager.setItemDirty(note, true);
            dirtyCount++;
          }
        }

        if(dirtyCount > 0) {
          if(isDesktopApplication()) {
            this.desktopManager.saveBackup();
          }

          status = this.statusManager.replaceStatusWithString(status, `${dirtyCount} items optimized.`);
          await this.syncManager.sync();

          status = this.statusManager.replaceStatusWithString(status, `Optimization complete.`);
          setTimeout(() => {
            this.statusManager.removeStatus(status);
          }, 2000);
        } else {
          this.statusManager.removeStatus(status);
        }
      }
    }
  }
}

angular.module('app').service('migrationManager', MigrationManager);
;SFModelManager.ContentTypeClassMapping = {
  "Note" : SNNote,
  "Tag" : SNTag,
  "SN|SmartTag" : SNSmartTag,
  "Extension" : SNExtension,
  "SN|Editor" : SNEditor,
  "SN|Theme" : SNTheme,
  "SN|Component" : SNComponent,
  "SF|Extension" : SNServerExtension,
  "SF|MFA" : SNMfa,
  "SN|Privileges" : SFPrivileges
};

SFItem.AppDomain = "org.standardnotes.sn";

class ModelManager extends SFModelManager {

  constructor(storageManager, $timeout) {
    super($timeout);
    this.notes = [];
    this.tags = [];
    this.components = [];

    this.storageManager = storageManager;

    this.buildSystemSmartTags();
  }

  handleSignout() {
    super.handleSignout();
    this.notes.length = 0;
    this.tags.length = 0;
    this.components.length = 0;
  }

  noteCount() {
    return this.notes.filter((n) => !n.dummy).length;
  }

  removeAllItemsFromMemory() {
    for(var item of this.items) {
      item.deleted = true;
    }
    this.notifySyncObserversOfModels(this.items);
    this.handleSignout();
  }

  findOrCreateTagByTitle(title) {
    var tag = _.find(this.tags, {title: title})
    if(!tag) {
      tag = this.createItem({content_type: "Tag", content: {title: title}});
      this.addItem(tag);
      this.setItemDirty(tag, true);
    }
    return tag;
  }

  addItems(items, globalOnly = false) {
    super.addItems(items, globalOnly);

    items.forEach((item) => {
      // In some cases, you just want to add the item to this.items, and not to the individual arrays
      // This applies when you want to keep an item syncable, but not display it via the individual arrays
      if(!globalOnly) {
        if(item.content_type == "Tag") {
          if(!_.find(this.tags, {uuid: item.uuid})) {
            this.tags.splice(_.sortedIndexBy(this.tags, item, function(item){
              if (item.title) return item.title.toLowerCase();
              else return ''
            }), 0, item);
          }
        } else if(item.content_type == "Note") {
          if(!_.find(this.notes, {uuid: item.uuid})) {
            this.notes.unshift(item);
          }
        } else if(item.content_type == "SN|Component") {
          if(!_.find(this.components, {uuid: item.uuid})) {
            this.components.unshift(item);
          }
        }
      }
    });
  }

  resortTag(tag) {
    _.pull(this.tags, tag);
    this.tags.splice(_.sortedIndexBy(this.tags, tag, function(tag){
      if (tag.title) return tag.title.toLowerCase();
      else return ''
    }), 0, tag);
  }

  setItemToBeDeleted(item) {
    super.setItemToBeDeleted(item);

    // remove from relevant array, but don't remove from all items.
    // This way, it's removed from the display, but still synced via get dirty items
    this.removeItemFromRespectiveArray(item);
  }

  removeItemLocally(item, callback) {
    super.removeItemLocally(item, callback);

    this.removeItemFromRespectiveArray(item);

    this.storageManager.deleteModel(item).then(callback);
  }

  removeItemFromRespectiveArray(item) {
    if(item.content_type == "Tag") {
      _.remove(this.tags, {uuid: item.uuid});
    } else if(item.content_type == "Note") {
      _.remove(this.notes, {uuid: item.uuid});
    } else if(item.content_type == "SN|Component") {
      _.remove(this.components, {uuid: item.uuid});
    }
  }

  notesMatchingSmartTag(tag) {
    let contentTypePredicate = new SFPredicate("content_type", "=", "Note");
    let predicates = [contentTypePredicate, tag.content.predicate];
    if(!tag.content.isTrashTag) {
      let notTrashedPredicate = new SFPredicate("content.trashed", "=", false);
      predicates.push(notTrashedPredicate);
    }
    let results = this.itemsMatchingPredicates(predicates);
    return results;
  }

  trashSmartTag() {
    return this.systemSmartTags.find((tag) => tag.content.isTrashTag);
  }

  trashedItems() {
    return this.notesMatchingSmartTag(this.trashSmartTag());
  }

  emptyTrash() {
    let notes = this.trashedItems();
    for(let note of notes) {
      this.setItemToBeDeleted(note);
    }
  }

  buildSystemSmartTags() {
    this.systemSmartTags = SNSmartTag.systemSmartTags();
  }

  getSmartTagWithId(id) {
    return this.getSmartTags().find((candidate) => candidate.uuid == id);
  }

  getSmartTags() {
    let userTags = this.validItemsForContentType("SN|SmartTag").sort((a, b) => {
      return a.content.title < b.content.title ? -1 : 1;
    });
    return this.systemSmartTags.concat(userTags);
  }

  /*
  Misc
  */

  humanReadableDisplayForContentType(contentType) {
    return {
      "Note" : "note",
      "Tag" : "tag",
      "SN|SmartTag": "smart tag",
      "Extension" : "action-based extension",
      "SN|Component" : "component",
      "SN|Editor" : "editor",
      "SN|Theme" : "theme",
      "SF|Extension" : "server extension",
      "SF|MFA" : "two-factor authentication setting",
      "SN|FileSafe|Credentials": "FileSafe credential",
      "SN|FileSafe|FileMetadata": "FileSafe file",
      "SN|FileSafe|Integration": "FileSafe integration"
    }[contentType];
  }

}

angular.module('app').service('modelManager', ModelManager);
;/* A class for handling installation of system extensions */

class NativeExtManager {

  constructor(modelManager, syncManager, singletonManager) {
    this.modelManager = modelManager;
    this.syncManager = syncManager;
    this.singletonManager = singletonManager;

    this.extensionsManagerIdentifier = "org.standardnotes.extensions-manager";
    this.batchManagerIdentifier = "org.standardnotes.batch-manager";
    this.systemExtensions = [];

    this.resolveExtensionsManager();
    this.resolveBatchManager();
  }

  isSystemExtension(extension) {
    return this.systemExtensions.includes(extension.uuid);
  }

  resolveExtensionsManager() {

    let contentTypePredicate = new SFPredicate("content_type", "=", "SN|Component");
    let packagePredicate = new SFPredicate("package_info.identifier", "=", this.extensionsManagerIdentifier);

    this.singletonManager.registerSingleton([contentTypePredicate, packagePredicate], (resolvedSingleton) => {
      // Resolved Singleton
      this.systemExtensions.push(resolvedSingleton.uuid);

      var needsSync = false;
      if(isDesktopApplication()) {
        if(!resolvedSingleton.local_url) {
          resolvedSingleton.local_url = window._extensions_manager_location;
          needsSync = true;
        }
      } else {
        if(!resolvedSingleton.hosted_url) {
          resolvedSingleton.hosted_url = window._extensions_manager_location;
          needsSync = true;
        }
      }

      // Handle addition of SN|ExtensionRepo permission
      let permission = resolvedSingleton.content.permissions.find((p) => p.name == "stream-items");
      if(!permission.content_types.includes("SN|ExtensionRepo")) {
        permission.content_types.push("SN|ExtensionRepo");
        needsSync = true;
      }

      if(needsSync) {
        this.modelManager.setItemDirty(resolvedSingleton, true);
        this.syncManager.sync();
      }
    }, (valueCallback) => {
      // Safe to create. Create and return object.
      let url = window._extensions_manager_location;
      // console.log("Installing Extensions Manager from URL", url);
      if(!url) {
        console.error("window._extensions_manager_location must be set.");
        return;
      }

      let packageInfo = {
        name: "Extensions",
        identifier: this.extensionsManagerIdentifier
      }

      var item = {
        content_type: "SN|Component",
        content: {
          name: packageInfo.name,
          area: "rooms",
          package_info: packageInfo,
          permissions: [
            {
              name: "stream-items",
              content_types: [
                "SN|Component", "SN|Theme", "SF|Extension",
                "Extension", "SF|MFA", "SN|Editor", "SN|ExtensionRepo"
              ]
            }
          ]
        }
      }

      if(isDesktopApplication()) {
        item.content.local_url = window._extensions_manager_location;
      } else {
        item.content.hosted_url = window._extensions_manager_location;
      }

      var component = this.modelManager.createItem(item);
      this.modelManager.addItem(component);

      this.modelManager.setItemDirty(component, true);
      this.syncManager.sync();

      this.systemExtensions.push(component.uuid);

      valueCallback(component);
    });
  }

  resolveBatchManager() {

    let contentTypePredicate = new SFPredicate("content_type", "=", "SN|Component");
    let packagePredicate = new SFPredicate("package_info.identifier", "=", this.batchManagerIdentifier);

    this.singletonManager.registerSingleton([contentTypePredicate, packagePredicate], (resolvedSingleton) => {
      // Resolved Singleton
      this.systemExtensions.push(resolvedSingleton.uuid);

      var needsSync = false;
      if(isDesktopApplication()) {
        if(!resolvedSingleton.local_url) {
          resolvedSingleton.local_url = window._batch_manager_location;
          needsSync = true;
        }
      } else {
        if(!resolvedSingleton.hosted_url) {
          resolvedSingleton.hosted_url = window._batch_manager_location;
          needsSync = true;
        }
      }

      if(needsSync) {
        this.modelManager.setItemDirty(resolvedSingleton, true);
        this.syncManager.sync();
      }
    }, (valueCallback) => {
      // Safe to create. Create and return object.
      let url = window._batch_manager_location;
      // console.log("Installing Batch Manager from URL", url);
      if(!url) {
        console.error("window._batch_manager_location must be set.");
        return;
      }

      let packageInfo = {
        name: "Batch Manager",
        identifier: this.batchManagerIdentifier
      }

      var item = {
        content_type: "SN|Component",
        content: {
          name: packageInfo.name,
          area: "modal",
          package_info: packageInfo,
          permissions: [
            {
              name: "stream-items",
              content_types: [
                "Note", "Tag", "SN|SmartTag",
                "SN|Component", "SN|Theme", "SN|UserPreferences",
                "SF|Extension", "Extension", "SF|MFA", "SN|Editor",
                "SN|FileSafe|Credentials", "SN|FileSafe|FileMetadata", "SN|FileSafe|Integration"
              ]
            }
          ]
        }
      }

      if(isDesktopApplication()) {
        item.content.local_url = window._batch_manager_location;
      } else {
        item.content.hosted_url = window._batch_manager_location;
      }

      var component = this.modelManager.createItem(item);
      this.modelManager.addItem(component);

      this.modelManager.setItemDirty(component, true);
      this.syncManager.sync();

      this.systemExtensions.push(component.uuid);

      valueCallback(component);
    });
  }
}

angular.module('app').service('nativeExtManager', NativeExtManager);
;const MillisecondsPerSecond = 1000;

class PasscodeManager {

    constructor($rootScope, authManager, storageManager, syncManager) {
      this.authManager = authManager;
      this.storageManager = storageManager;
      this.syncManager = syncManager;
      this.$rootScope = $rootScope;

      this._hasPasscode = this.storageManager.getItemSync("offlineParams", StorageManager.Fixed) != null;
      this._locked = this._hasPasscode;

      this.visibilityObservers = [];
      this.passcodeChangeObservers = [];

      this.configureAutoLock();
    }

    addPasscodeChangeObserver(callback) {
      this.passcodeChangeObservers.push(callback);
    }

    lockApplication() {
      window.location.reload();
      this.cancelAutoLockTimer();
    }

    isLocked() {
      return this._locked;
    }

    hasPasscode() {
      return this._hasPasscode;
    }

    keys() {
      return this._keys;
    }

    addVisibilityObserver(callback) {
      this.visibilityObservers.push(callback);
      return callback;
    }

    removeVisibilityObserver(callback) {
      _.pull(this.visibilityObservers, callback);
    }

    notifiyVisibilityObservers(visible) {
      for(let callback of this.visibilityObservers)  {
        callback(visible);
      }
    }

    async setAutoLockInterval(interval) {
      return this.storageManager.setItem(PasscodeManager.AutoLockIntervalKey, JSON.stringify(interval), StorageManager.FixedEncrypted);
    }

    async getAutoLockInterval() {
      let interval = await this.storageManager.getItem(PasscodeManager.AutoLockIntervalKey, StorageManager.FixedEncrypted);
      if(interval) {
        return JSON.parse(interval);
      } else {
        return PasscodeManager.AutoLockIntervalNone;
      }
    }

    passcodeAuthParams() {
      var authParams = JSON.parse(this.storageManager.getItemSync("offlineParams", StorageManager.Fixed));
      if(authParams && !authParams.version) {
        var keys = this.keys();
        if(keys && keys.ak) {
          // If there's no version stored, and there's an ak, it has to be 002. Newer versions would have their version stored in authParams.
          authParams.version = "002";
        } else {
          authParams.version = "001";
        }
      }
      return authParams;
    }

    async verifyPasscode(passcode) {
      return new Promise(async (resolve, reject) => {
        var params = this.passcodeAuthParams();
        let keys = await SFJS.crypto.computeEncryptionKeysForUser(passcode, params);
        if(keys.pw !== params.hash) {
          resolve(false);
        } else {
          resolve(true);
        }
      })
    }

    unlock(passcode, callback) {
      var params = this.passcodeAuthParams();
      SFJS.crypto.computeEncryptionKeysForUser(passcode, params).then((keys) => {
        if(keys.pw !== params.hash) {
          callback(false);
          return;
        }

        this._keys = keys;
        this._authParams = params;
        this.decryptLocalStorage(keys, params).then(() => {
          this._locked = false;
          callback(true);
        })
      });
    }

    setPasscode(passcode, callback) {
      var uuid = SFJS.crypto.generateUUIDSync();

      SFJS.crypto.generateInitialKeysAndAuthParamsForUser(uuid, passcode).then((results) => {
        let keys = results.keys;
        let authParams = results.authParams;

        authParams.hash = keys.pw;
        this._keys = keys;
        this._hasPasscode = true;
        this._authParams = authParams;

        // Encrypting will initially clear localStorage
        this.encryptLocalStorage(keys, authParams);

        // After it's cleared, it's safe to write to it
        this.storageManager.setItem("offlineParams", JSON.stringify(authParams), StorageManager.Fixed);
        callback(true);

        this.notifyObserversOfPasscodeChange();
      });
    }

    changePasscode(newPasscode, callback) {
      this.setPasscode(newPasscode, callback);
    }

    clearPasscode() {
      this.storageManager.setItemsMode(this.authManager.isEphemeralSession() ? StorageManager.Ephemeral : StorageManager.Fixed); // Transfer from Ephemeral
      this.storageManager.removeItem("offlineParams", StorageManager.Fixed);
      this._keys = null;
      this._hasPasscode = false;

      this.notifyObserversOfPasscodeChange();
    }

    notifyObserversOfPasscodeChange() {
      for(var observer of this.passcodeChangeObservers) {
        observer();
      }
    }

    encryptLocalStorage(keys, authParams) {
      this.storageManager.setKeys(keys, authParams);
      // Switch to Ephemeral storage, wiping Fixed storage
      // Last argument is `force`, which we set to true because in the case of changing passcode
      this.storageManager.setItemsMode(this.authManager.isEphemeralSession() ? StorageManager.Ephemeral : StorageManager.FixedEncrypted, true);
    }

    async decryptLocalStorage(keys, authParams) {
      this.storageManager.setKeys(keys, authParams);
      return this.storageManager.decryptStorage();
    }

    configureAutoLock() {
      if(isDesktopApplication()) {
        // desktop only
        this.$rootScope.$on("window-lost-focus", () => {
          this.documentVisibilityChanged(false);
        })
        this.$rootScope.$on("window-gained-focus", () => {
          this.documentVisibilityChanged(true);
        })
      } else {
        // tab visibility listender, web only
        document.addEventListener('visibilitychange', (e) => {
          let visible = document.visibilityState == "visible";
          this.documentVisibilityChanged(visible);
        });
      }

      PasscodeManager.AutoLockIntervalNone = 0;
      PasscodeManager.AutoLockIntervalImmediate = 1;
      PasscodeManager.AutoLockIntervalOneMinute = 60 * MillisecondsPerSecond;
      PasscodeManager.AutoLockIntervalFiveMinutes = 300 * MillisecondsPerSecond;
      PasscodeManager.AutoLockIntervalOneHour = 3600 * MillisecondsPerSecond;

      PasscodeManager.AutoLockIntervalKey = "AutoLockIntervalKey";
    }

    getAutoLockIntervalOptions() {
      return [
        {
          value: PasscodeManager.AutoLockIntervalNone,
          label: "Off"
        },
        {
          value: PasscodeManager.AutoLockIntervalImmediate,
          label: "Immediately"
        },
        {
          value: PasscodeManager.AutoLockIntervalOneMinute,
          label: "1m"
        },
        {
          value: PasscodeManager.AutoLockIntervalFiveMinutes,
          label: "5m"
        },
        {
          value: PasscodeManager.AutoLockIntervalOneHour,
          label: "1h"
        }
      ]
    }

    documentVisibilityChanged(visible) {
      if(visible) {
        // check to see if lockAfterDate is not null, and if the application isn't locked.
        // if that's the case, it needs to be locked immediately.
        if(this.lockAfterDate && new Date() > this.lockAfterDate && !this.isLocked()) {
          this.lockApplication();
        } else {
          if(!this.isLocked()) {
            this.syncManager.sync();
          }
        }
        this.cancelAutoLockTimer();
      } else {
        this.beginAutoLockTimer();
      }

      this.notifiyVisibilityObservers(visible);
    }

    async beginAutoLockTimer() {
      var interval = await this.getAutoLockInterval();
      if(interval == PasscodeManager.AutoLockIntervalNone) {
        return;
      }

      // Use a timeout if possible, but if the computer is put to sleep, timeouts won't work.
      // Need to set a date as backup. this.lockAfterDate does not need to be persisted, as
      // living in memory seems sufficient. If memory is cleared, then the application will lock anyway.
      let addToNow = (seconds) => {
        let date = new Date();
        date.setSeconds(date.getSeconds() + seconds);
        return date;
      }

      this.lockAfterDate = addToNow(interval / MillisecondsPerSecond);
      this.lockTimeout = setTimeout(() => {
        this.lockApplication();
        // We don't need to look at this anymore since we've succeeded with timeout lock
        this.lockAfterDate = null;
      }, interval);
    }

    cancelAutoLockTimer() {
      clearTimeout(this.lockTimeout);
      this.lockAfterDate = null;
    }
}

angular.module('app').service('passcodeManager', PasscodeManager);
;class PrivilegesManager extends SFPrivilegesManager {

  constructor(passcodeManager, authManager, syncManager, singletonManager, modelManager, storageManager, $rootScope, $compile) {
    super(modelManager, syncManager, singletonManager);

    this.$rootScope = $rootScope;
    this.$compile = $compile;

    this.setDelegate({
      isOffline: async () => {
        return authManager.offline();
      },
      hasLocalPasscode: async () => {
        return passcodeManager.hasPasscode();
      },
      saveToStorage: async (key, value) => {
        return storageManager.setItem(key, value, storageManager.bestStorageMode());
      },
      getFromStorage: async (key) => {
        return storageManager.getItem(key, storageManager.bestStorageMode());
      },
      verifyAccountPassword: async (password) => {
        return authManager.verifyAccountPassword(password);
      },
      verifyLocalPasscode: async (passcode) => {
        return passcodeManager.verifyPasscode(passcode);
      },
    });
  }

  presentPrivilegesModal(action, onSuccess, onCancel) {
    if(this.authenticationInProgress()) {
      onCancel && onCancel();
      return;
    }

    let customSuccess = () => {
      onSuccess && onSuccess();
      this.currentAuthenticationElement = null;
    }

    let customCancel = () => {
      onCancel && onCancel();
      this.currentAuthenticationElement = null;
    }

    var scope = this.$rootScope.$new(true);
    scope.action = action;
    scope.onSuccess = customSuccess;
    scope.onCancel = customCancel;
    var el = this.$compile( "<privileges-auth-modal action='action' on-success='onSuccess' on-cancel='onCancel' class='sk-modal'></privileges-auth-modal>" )(scope);
    angular.element(document.body).append(el);

    this.currentAuthenticationElement = el;
  }

  presentPrivilegesManagementModal() {
    var scope = this.$rootScope.$new(true);
    var el = this.$compile( "<privileges-management-modal class='sk-modal'></privileges-management-modal>")(scope);
    angular.element(document.body).append(el);
  }

  authenticationInProgress() {
    return this.currentAuthenticationElement != null;
  }

}

angular.module('app').service('privilegesManager', PrivilegesManager);
;class SessionHistory extends SFSessionHistoryManager {

  constructor(modelManager, storageManager, authManager, passcodeManager, $timeout) {

    SFItemHistory.HistoryEntryClassMapping = {
      "Note" : NoteHistoryEntry
    }

    // Session History can be encrypted with passcode keys. If it changes, we need to resave session
    // history with the new keys.
    passcodeManager.addPasscodeChangeObserver(() => {
      this.saveToDisk();
    })

    var keyRequestHandler = async () => {
      let offline = authManager.offline();
      let auth_params = offline ? passcodeManager.passcodeAuthParams() : await authManager.getAuthParams();
      let keys = offline ? passcodeManager.keys() : await authManager.keys();

      return {
        keys: keys,
        offline: offline,
        auth_params: auth_params
      }
    }

    var contentTypes = ["Note"];
    super(modelManager, storageManager, keyRequestHandler, contentTypes, $timeout);
  }
}

angular.module('app').service('sessionHistory', SessionHistory);
;class SingletonManager extends SFSingletonManager {

  constructor(modelManager, syncManager) {
    super(modelManager, syncManager);
  }
}

angular.module('app').service('singletonManager', SingletonManager);
;class StatusManager {

  constructor() {
    this.statuses = [];
    this.observers = [];
  }

  statusFromString(string) {
    return {string: string};
  }

  replaceStatusWithString(status, string) {
    this.removeStatus(status);
    return this.addStatusFromString(string);
  }

  addStatusFromString(string) {
    return this.addStatus(this.statusFromString(string));
  }

  addStatus(status) {
    if(typeof status !== "object") {
      console.error("Attempting to set non-object status", status);
      return;
    }

    this.statuses.push(status);
    this.notifyObservers();
    return status;
  }

  removeStatus(status) {
    _.pull(this.statuses, status);
    this.notifyObservers();
    return null;
  }

  getStatusString() {
    let result = "";
    this.statuses.forEach((status, index) => {
      if(index > 0) {
        result += "  ";
      }
      result += status.string;
    })

    return result;
  }

  notifyObservers() {
    for(let observer of this.observers) {
      observer(this.getStatusString());
    }
  }

  addStatusObserver(callback) {
    this.observers.push(callback);
  }

  removeStatusObserver(callback) {
    _.pull(this.statuses, callback);
  }


}

angular.module('app').service('statusManager', StatusManager);
;class MemoryStorage {
  constructor() {
    this.memory = {};
  }

  getItem(key) {
    return this.memory[key] || null;
  }

  getItemSync(key) {
    return this.getItem(key);
  }

  get length() {
    return Object.keys(this.memory).length;
  }

  setItem(key, value) {
    this.memory[key] = value;
  }

  removeItem(key) {
    delete this.memory[key];
  }

  clear() {
    this.memory = {};
  }

  keys() {
    return Object.keys(this.memory);
  }

  key(index) {
    return Object.keys(this.memory)[index];
  }
}

class StorageManager extends SFStorageManager {

  constructor(dbManager) {
    super();
    this.dbManager = dbManager;
  }

  initialize(hasPasscode, ephemeral) {
    if(hasPasscode) {
      // We don't want to save anything in fixed storage except for actual item data (in IndexedDB)
      this.storage = this.memoryStorage;
      this.itemsStorageMode = StorageManager.FixedEncrypted;
    } else if(ephemeral) {
      // We don't want to save anything in fixed storage as well as IndexedDB
      this.storage = this.memoryStorage;
      this.itemsStorageMode = StorageManager.Ephemeral;
    } else {
      this.storage = localStorage;
      this.itemsStorageMode = StorageManager.Fixed;
    }

    this.modelStorageMode = ephemeral ? StorageManager.Ephemeral : StorageManager.Fixed;
  }

  get memoryStorage() {
    if(!this._memoryStorage) {
      this._memoryStorage = new MemoryStorage();
    }
    return this._memoryStorage;
  }

  setItemsMode(mode, force) {
    var newStorage = this.getVault(mode);
    if(newStorage !== this.storage || mode !== this.itemsStorageMode || force) {
      // transfer storages
      var length = this.storage.length;
      for(var i = 0; i < length; i++) {
        var key = this.storage.key(i);
        newStorage.setItem(key, this.storage.getItem(key));
      }

      this.itemsStorageMode = mode;
      if(newStorage !== this.storage) {
        // Only clear if this.storage isn't the same reference as newStorage
        this.storage.clear();
      }
      this.storage = newStorage;

      if(mode == StorageManager.FixedEncrypted) {
        this.writeEncryptedStorageToDisk();
      } else if(mode == StorageManager.Fixed) {
        // Remove encrypted storage
        this.removeItem("encryptedStorage", StorageManager.Fixed);
      }
    }
  }

  getVault(vaultKey) {
    if(vaultKey) {
      if(vaultKey == StorageManager.Ephemeral || vaultKey == StorageManager.FixedEncrypted) {
        return this.memoryStorage;
      } else {
        return localStorage;
      }
    } else {
      return this.storage;
    }
  }

  async setItem(key, value, vaultKey) {
    var storage = this.getVault(vaultKey);
    try {
      storage.setItem(key, value);
    } catch (e) {
      console.error("Exception while trying to setItem in StorageManager:", e);
      alert("The application's local storage is out of space. If you have Session History save-to-disk enabled, please disable it, and try again.");
    }

    if(vaultKey === StorageManager.FixedEncrypted || (!vaultKey && this.itemsStorageMode === StorageManager.FixedEncrypted)) {
      this.writeEncryptedStorageToDisk();
    }
  }

  async getItem(key, vault) {
    return this.getItemSync(key, vault);
  }

  getItemSync(key, vault) {
    var storage = this.getVault(vault);
    return storage.getItem(key);
  }

  async removeItem(key, vault) {
    var storage = this.getVault(vault);
    return storage.removeItem(key);
  }

  async clear() {
    this.memoryStorage.clear();
    localStorage.clear();
  }

  storageAsHash() {
    var hash = {};
    var length = this.storage.length;
    for(var i = 0; i < length; i++) {
      var key = this.storage.key(i);
      hash[key] = this.storage.getItem(key)
    }
    return hash;
  }

  setKeys(keys, authParams) {
    this.encryptedStorageKeys = keys;
    this.encryptedStorageAuthParams = authParams;
  }

  writeEncryptedStorageToDisk() {
    var encryptedStorage = new SNEncryptedStorage();
    // Copy over totality of current storage
    encryptedStorage.content.storage = this.storageAsHash();

    // Save new encrypted storage in Fixed storage
    var params = new SFItemParams(encryptedStorage, this.encryptedStorageKeys, this.encryptedStorageAuthParams);
    params.paramsForSync().then((syncParams) => {
      this.setItem("encryptedStorage", JSON.stringify(syncParams), StorageManager.Fixed);
    })
  }

  async decryptStorage() {
    var stored = JSON.parse(this.getItemSync("encryptedStorage", StorageManager.Fixed));
    await SFJS.itemTransformer.decryptItem(stored, this.encryptedStorageKeys);
    var encryptedStorage = new SNEncryptedStorage(stored);

    for(var key of Object.keys(encryptedStorage.content.storage)) {
      this.setItem(key, encryptedStorage.storage[key]);
    }
  }

  hasPasscode() {
    return this.getItemSync("encryptedStorage", StorageManager.Fixed) !== null;
  }

  bestStorageMode() {
    return this.hasPasscode() ? StorageManager.FixedEncrypted : StorageManager.Fixed;
  }


  /*
  Model Storage

  If using ephemeral storage, we don't need to write it to anything as references will be held already by controllers
  and the global modelManager service.
  */

  setModelStorageMode(mode) {
    if(mode == this.modelStorageMode) {
      return;
    }

    if(mode == StorageManager.Ephemeral) {
      // Clear IndexedDB
      this.dbManager.clearAllModels(null);
    } else {
      // Fixed
    }

    this.modelStorageMode = mode;
  }

  async getAllModels() {
    return new Promise((resolve, reject) => {
      if(this.modelStorageMode == StorageManager.Fixed) {
        this.dbManager.getAllModels(resolve);
      } else {
        resolve();
      }
    })
  }

  async saveModel(item) {
    return this.saveModels([item]);
  }

  async saveModels(items, onsuccess, onerror) {
    return new Promise((resolve, reject) => {
      if(this.modelStorageMode == StorageManager.Fixed) {
        this.dbManager.saveModels(items, resolve, reject);
      } else {
        resolve();
      }
    });
  }

  async deleteModel(item) {
    return new Promise((resolve, reject) => {
      if(this.modelStorageMode == StorageManager.Fixed) {
        this.dbManager.deleteModel(item, resolve);
      } else {
        resolve();
      }
    });
  }

  async clearAllModels() {
    return new Promise((resolve, reject) => {
      this.dbManager.clearAllModels(resolve);
    });
  }
}

StorageManager.FixedEncrypted = "FixedEncrypted"; // encrypted memoryStorage + localStorage persistence
StorageManager.Ephemeral = "Ephemeral"; // memoryStorage
StorageManager.Fixed = "Fixed"; // localStorage

angular.module('app').service('storageManager', StorageManager);
;class SyncManager extends SFSyncManager {

  constructor(modelManager, storageManager, httpManager, $timeout, $interval, $compile, $rootScope) {
    super(modelManager, storageManager, httpManager, $timeout, $interval);
    this.$rootScope = $rootScope;
    this.$compile = $compile;

    // this.loggingEnabled = true;

    // Content types appearing first are always mapped first
    this.contentTypeLoadPriority = [
      "SN|UserPreferences", "SN|Privileges",
      "SN|Component", "SN|Theme"];
  }

  presentConflictResolutionModal(items, callback) {
    var scope = this.$rootScope.$new(true);
    scope.item1 = items[0];
    scope.item2 = items[1];
    scope.callback = callback;
    var el = this.$compile( "<conflict-resolution-modal item1='item1' item2='item2' callback='callback' class='sk-modal'></conflict-resolution-modal>" )(scope);
    angular.element(document.body).append(el);
  }

}

angular.module('app').service('syncManager', SyncManager);
;class ThemeManager {

  constructor(componentManager, desktopManager, storageManager, passcodeManager) {
    this.componentManager = componentManager;
    this.storageManager = storageManager;
    this.desktopManager = desktopManager;
    this.activeThemes = [];

    ThemeManager.CachedThemesKey = "cachedThemes";

    this.registerObservers();

    // When a passcode is added, all local storage will be encrypted (it doesn't know what was
    // originally saved as Fixed or FixedEncrypted). We want to rewrite cached themes here to Fixed
    // so that it's readable without authentication.
    passcodeManager.addPasscodeChangeObserver(() => {
      this.cacheThemes();
    })

    // The desktop application won't have its applicationDataPath until the angular document is ready,
    // so it wont be able to resolve local theme urls until thats ready
    angular.element(document).ready(() => {
      this.activateCachedThemes();
    });
  }

  activateCachedThemes() {
    let cachedThemes = this.getCachedThemes();
    let writeToCache = false;
    for(var theme of cachedThemes) {
      this.activateTheme(theme, writeToCache);
    }
  }

  registerObservers() {
    this.desktopManager.registerUpdateObserver((component) => {
      // Reload theme if active
      if(component.active && component.isTheme()) {
        this.deactivateTheme(component);
        setTimeout(() => {
          this.activateTheme(component);
        }, 10);
      }
    })

    this.componentManager.registerHandler({identifier: "themeManager", areas: ["themes"], activationHandler: (component) => {
      if(component.active) {
        this.activateTheme(component);
      } else {
        this.deactivateTheme(component);
      }
    }});
  }

  hasActiveTheme() {
    return this.componentManager.getActiveThemes().length > 0;
  }

  deactivateAllThemes() {
    var activeThemes = this.componentManager.getActiveThemes();
    for(var theme of activeThemes) {
      if(theme) {
        this.componentManager.deactivateComponent(theme);
      }
    }

    this.decacheThemes();
  }

  activateTheme(theme, writeToCache = true) {
    if(_.find(this.activeThemes, {uuid: theme.uuid})) {
      return;
    }

    this.activeThemes.push(theme);

    var url = this.componentManager.urlForComponent(theme);
    var link = document.createElement("link");
    link.href = url;
    link.type = "text/css";
    link.rel = "stylesheet";
    link.media = "screen,print";
    link.id = theme.uuid;
    document.getElementsByTagName("head")[0].appendChild(link);

    if(writeToCache) {
      this.cacheThemes();
    }
  }

  deactivateTheme(theme) {
    var element = document.getElementById(theme.uuid);
    if(element) {
      element.disabled = true;
      element.parentNode.removeChild(element);
    }

    _.remove(this.activeThemes, {uuid: theme.uuid});

    this.cacheThemes();
  }

  async cacheThemes() {
    let mapped = await Promise.all(this.activeThemes.map(async (theme) => {
      let transformer = new SFItemParams(theme);
      let params = await transformer.paramsForLocalStorage();
      return params;
    }));
    let data = JSON.stringify(mapped);
    return this.storageManager.setItem(ThemeManager.CachedThemesKey, data, StorageManager.Fixed);
  }

  async decacheThemes() {
    return this.storageManager.removeItem(ThemeManager.CachedThemesKey, StorageManager.Fixed);
  }

  getCachedThemes() {
    let cachedThemes = this.storageManager.getItemSync(ThemeManager.CachedThemesKey, StorageManager.Fixed);
    if(cachedThemes) {
      let parsed = JSON.parse(cachedThemes);
      return parsed.map((theme) => {
        return new SNTheme(theme);
      });
    } else {
      return [];
    }
  }
}

angular.module('app').service('themeManager', ThemeManager);
;// reuse
var locale, formatter;

angular.module('app')
  .filter('appDate', function ($filter) {
      return function (input) {
          return input ? $filter('date')(new Date(input), 'MM/dd/yyyy', 'UTC') : '';
      };
  })
  .filter('appDateTime', function ($filter) {
      return function (input) {
        if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
          if (!formatter) {
            locale = (navigator.languages && navigator.languages.length) ? navigator.languages[0] : navigator.language;
            formatter = new Intl.DateTimeFormat(locale, {
              year: 'numeric',
              month: 'numeric',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            });
          }
          return formatter.format(input);
        } else {
          return input ? $filter('date')(new Date(input), 'MM/dd/yyyy h:mm a') : '';
        }
      }
  });
;angular.module('app').filter('trusted', ['$sce', function ($sce) {
    return function(url) {
        return $sce.trustAsResourceUrl(url);
    };
}]);
;angular
  .module('app')
  .directive('snAutofocus', ['$timeout', function($timeout) {
    return {
      restrict: 'A',
      scope: {
        shouldFocus: "="
      },
      link : function($scope, $element) {
        $timeout(function() {
          if($scope.shouldFocus) {
            $element[0].focus();
          }
        });
      }
    }
  }]);
;angular
  .module('app')
  .directive('clickOutside', ['$document', function($document) {
    return {
      restrict: 'A',
      replace: false,
      link : function($scope, $element, attrs) {

        var didApplyClickOutside = false;

        $element.bind('click', function(e) {
          didApplyClickOutside = false;
          if (attrs.isOpen) {
            e.stopPropagation();
          }
        });

        $document.bind('click', function() {
          if(!didApplyClickOutside) {
            $scope.$apply(attrs.clickOutside);
            didApplyClickOutside = true;
          }
        })

      }
    }
  }]);
;angular
  .module('app')
  .directive('delayHide', function($timeout) {
   return {
     restrict: 'A',
     scope: {
       show: '=',
       delay: '@'
     },
     link: function(scope, elem, attrs) {
       var showTimer;

       showElement(false);

       //This is where all the magic happens!
       // Whenever the scope variable updates we simply
       // show if it evaluates to 'true' and hide if 'false'
       scope.$watch('show', function(newVal){
         newVal ? showSpinner() : hideSpinner();
       });

       function showSpinner() {
         if(scope.hidePromise) {
           $timeout.cancel(scope.hidePromise);
           scope.hidePromise = null;
         }
         showElement(true);
       }

       function hideSpinner() {
          scope.hidePromise = $timeout(showElement.bind(this, false), getDelay());
       }

       function showElement(show) {
         show ? elem.css({display:''}) : elem.css({display:'none'});
       }

       function getDelay() {
         var delay = parseInt(scope.delay);

         return angular.isNumber(delay) ? delay : 200;
       }
     }

   };
});
;angular
.module('app')
.directive( 'elemReady', function( $parse ) {
   return {
       restrict: 'A',
       link: function( $scope, elem, attrs ) {
          elem.ready(function(){
            $scope.$apply(function(){
                var func = $parse(attrs.elemReady);
                func($scope);
            })
          })
       }
    }
})
;angular
  .module('app')
  .directive('fileChange', function() {
    return {
     restrict: 'A',
     scope: {
       handler: '&'
     },
     link: function (scope, element) {
      element.on('change', function (event) {
        scope.$apply(function(){
          scope.handler({files: event.target.files});
        });
      });
     }
    };
});
;angular.module('app').directive('infiniteScroll', [
'$rootScope', '$window', '$timeout', function($rootScope, $window, $timeout) {
  return {
    link: function(scope, elem, attrs) {
      var offset = parseInt(attrs.threshold) || 0;
      var e = elem[0]

      elem.on('scroll', function(){
        if(scope.$eval(attrs.canLoad) && e.scrollTop + e.offsetHeight >= e.scrollHeight - offset) {
          scope.$apply(attrs.infiniteScroll);
        }
      });
    }
  };
}
]);
;angular
  .module('app')
  .directive('lowercase', function() {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, modelCtrl) {
        var lowercase = function(inputValue) {
          if (inputValue == undefined) inputValue = '';
          var lowercased = inputValue.toLowerCase();
          if (lowercased !== inputValue) {
            modelCtrl.$setViewValue(lowercased);
            modelCtrl.$render();
          }
          return lowercased;
        }
        modelCtrl.$parsers.push(lowercase);
        lowercase(scope[attrs.ngModel]);
      }
    };
  });
;angular
  .module('app')
  .directive('selectOnClick', ['$window', function ($window) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.on('focus', function () {
                if (!$window.getSelection().toString()) {
                    // Required for mobile Safari
                    this.setSelectionRange(0, this.value.length)
                }
            });
        }
    };
}]);
;angular
.module('app')
.directive('snEnter', function() {
  return function(scope, element, attrs) {
    element.bind("keydown keypress", function(event) {
      if(event.which === 13) {
        scope.$apply(function(){
            scope.$eval(attrs.snEnter, {'event': event});
        });

        event.preventDefault();
      }
    });
  };
});
;class AccountMenu {

  constructor() {
    this.restrict = "E";
    this.templateUrl = "directives/account-menu.html";
    this.scope = {
      "onSuccessfulAuth" : "&",
      "closeFunction" : "&"
    };
  }

  controller($scope, $rootScope, authManager, modelManager, syncManager, storageManager, dbManager, passcodeManager,
    $timeout, $compile, archiveManager, privilegesManager, appVersion) {
    'ngInject';

    $scope.appVersion = "v" + appVersion;
    $scope.formData = {mergeLocal: true, ephemeral: false};

    $scope.user = authManager.user;

    syncManager.getServerURL().then((url) => {
      $timeout(() => {
        $scope.server = url;
        $scope.formData.url = url;
      })
    })

    authManager.checkForSecurityUpdate().then((available) => {
        $scope.securityUpdateAvailable = available;
    })

    $scope.close = function() {
      $timeout(() => {
        $scope.closeFunction()();
      })
    }

    $scope.encryptedBackupsAvailable = function() {
      return authManager.user || passcodeManager.hasPasscode();
    }

    $scope.canAddPasscode = !authManager.isEphemeralSession();
    $scope.syncStatus = syncManager.syncStatus;

    $scope.submitMfaForm = function() {
      var params = {};
      params[$scope.formData.mfa.payload.mfa_key] = $scope.formData.userMfaCode;
      $scope.login(params);
    }

    $scope.submitAuthForm = function() {
      if(!$scope.formData.email || !$scope.formData.user_password) {
        return;
      }
      if($scope.formData.showLogin) {
        $scope.login();
      } else {
        $scope.register();
      }
    }

    $scope.login = function(extraParams) {
      // Prevent a timed sync from occuring while signing in. There may be a race condition where when
      // calling `markAllItemsDirtyAndSaveOffline` during sign in, if an authenticated sync happens to occur
      // right before that's called, items retreived from that sync will be marked as dirty, then resynced, causing mass duplication.
      // Unlock sync after all sign in processes are complete.
      syncManager.lockSyncing();

      $scope.formData.status = "Generating Login Keys...";
      $scope.formData.authenticating = true;
      $timeout(function(){
        authManager.login($scope.formData.url, $scope.formData.email, $scope.formData.user_password,
          $scope.formData.ephemeral, $scope.formData.strictSignin, extraParams).then((response) => {
            $timeout(() => {
              if(!response || response.error) {

                syncManager.unlockSyncing();

                $scope.formData.status = null;
                var error = response ? response.error : {message: "An unknown error occured."}

                // MFA Error
                if(error.tag == "mfa-required" || error.tag == "mfa-invalid") {
                  $scope.formData.showLogin = false;
                  $scope.formData.mfa = error;
                }
                // General Error
                else {
                  $scope.formData.showLogin = true;
                  $scope.formData.mfa = null;
                  if(error.message) { alert(error.message); }
                }

                $scope.formData.authenticating = false;
              }
              // Success
              else {
                $scope.onAuthSuccess(() => {
                  syncManager.unlockSyncing();
                  syncManager.sync({performIntegrityCheck: true});
                });
              }
            })
        });
      })
    }

    $scope.register = function() {
      let confirmation = $scope.formData.password_conf;
      if(confirmation !== $scope.formData.user_password) {
        alert("The two passwords you entered do not match. Please try again.");
        return;
      }

      $scope.formData.confirmPassword = false;
      $scope.formData.status = "Generating Account Keys...";
      $scope.formData.authenticating = true;

      $timeout(function(){
        authManager.register($scope.formData.url, $scope.formData.email, $scope.formData.user_password, $scope.formData.ephemeral).then((response) => {
          $timeout(() => {
            if(!response || response.error) {
              $scope.formData.status = null;
              var error = response ? response.error : {message: "An unknown error occured."}
              $scope.formData.authenticating = false;
              alert(error.message);
            } else {
              $scope.onAuthSuccess(() => {
                syncManager.sync();
              });
            }
          })
        });
      })
    }

    $scope.mergeLocalChanged = function() {
      if(!$scope.formData.mergeLocal) {
        if(!confirm("Unchecking this option means any of the notes you have written while you were signed out will be deleted. Are you sure you want to discard these notes?")) {
          $scope.formData.mergeLocal = true;
        }
      }
    }

    $scope.onAuthSuccess = function(callback) {
      var block = function() {
        $timeout(function(){
          $scope.formData.authenticating = false;
          $scope.onSuccessfulAuth()();
          syncManager.refreshErroredItems();
          callback && callback();
        })
      }

      if($scope.formData.mergeLocal) {
        // Allows desktop to make backup file
        $rootScope.$broadcast("major-data-change");
        $scope.clearDatabaseAndRewriteAllItems(true, block);
      }
      else {
        modelManager.removeAllItemsFromMemory();
        storageManager.clearAllModels().then(() => {
          block();
        })
      }
    }

    $scope.openPasswordWizard = function(type) {
      // Close the account menu
      $scope.close();
      authManager.presentPasswordWizard(type);
    }

    $scope.openPrivilegesModal = async function() {
      $scope.close();

      let run = () => {
        $timeout(() => {
          privilegesManager.presentPrivilegesManagementModal();
        })
      }

      if(await privilegesManager.actionRequiresPrivilege(PrivilegesManager.ActionManagePrivileges)) {
        privilegesManager.presentPrivilegesModal(PrivilegesManager.ActionManagePrivileges, () => {
          run();
        });
      } else {
        run();
      }
    }

    // Allows indexeddb unencrypted logs to be deleted
    // clearAllModels will remove data from backing store, but not from working memory
    // See: https://github.com/standardnotes/desktop/issues/131
    $scope.clearDatabaseAndRewriteAllItems = function(alternateUuids, callback) {
      storageManager.clearAllModels().then(() => {
        syncManager.markAllItemsDirtyAndSaveOffline(alternateUuids).then(() => {
          callback && callback();
        })
      });
    }

    $scope.destroyLocalData = function() {
      if(!confirm("Are you sure you want to end your session? This will delete all local items and extensions.")) {
        return;
      }

      authManager.signout(true).then(() => {
        window.location.reload();
      })
    }

    /* Import/Export */

    $scope.archiveFormData = {encrypted: $scope.encryptedBackupsAvailable() ? true : false};
    $scope.user = authManager.user;

    $scope.submitImportPassword = function() {
      $scope.performImport($scope.importData.data, $scope.importData.password);
    }

    $scope.performImport = function(data, password) {
      $scope.importData.loading = true;
      // allow loading indicator to come up with timeout
      $timeout(function(){
        $scope.importJSONData(data, password, function(response, errorCount){
          $timeout(function(){
            $scope.importData.loading = false;
            $scope.importData = null;

            // Update UI before showing alert
            setTimeout(function () {
              // Response can be null if syncing offline
              if(response && response.error) {
                alert("There was an error importing your data. Please try again.");
              } else {
                if(errorCount > 0) {
                  var message = `Import complete. ${errorCount} items were not imported because there was an error decrypting them. Make sure the password is correct and try again.`;
                  alert(message);
                } else {
                  alert("Your data has been successfully imported.")
                }
              }
            }, 10);
          })
        })
      })
    }

    $scope.importFileSelected = async function(files) {

      let run = () => {
        $timeout(() => {
          $scope.importData = {};

          var file = files[0];
          var reader = new FileReader();
          reader.onload = function(e) {
            try {
              var data = JSON.parse(e.target.result);
              $timeout(function(){
                if(data.auth_params) {
                  // request password
                  $scope.importData.requestPassword = true;
                  $scope.importData.data = data;

                  $timeout(() => {
                    var element = document.getElementById("import-password-request");
                    if(element) {
                      element.scrollIntoView(false);
                    }
                  })
                } else {
                  $scope.performImport(data, null);
                }
              })
            } catch (e) {
                alert("Unable to open file. Ensure it is a proper JSON file and try again.");
            }
          }

          reader.readAsText(file);
        })
      }

      if(await privilegesManager.actionRequiresPrivilege(PrivilegesManager.ActionManageBackups)) {
        privilegesManager.presentPrivilegesModal(PrivilegesManager.ActionManageBackups, () => {
          run();
        });
      } else {
        run();
      }
    }

    $scope.importJSONData = function(data, password, callback) {
      var onDataReady = async (errorCount) => {
        var items = await modelManager.importItems(data.items);
        for(var item of items) {
          // We don't want to activate any components during import process in case of exceptions
          // breaking up the import proccess
          if(item.content_type == "SN|Component") { item.active = false; }
        }

        syncManager.sync().then((response) => {
          // Response can be null if syncing offline
          callback(response, errorCount);
        });
      }

      if(data.auth_params) {
        SFJS.crypto.computeEncryptionKeysForUser(password, data.auth_params).then((keys) => {
          try {
            SFJS.itemTransformer.decryptMultipleItems(data.items, keys, false) /* throws = false as we don't want to interrupt all decryption if just one fails */
            .then(() => {
              // delete items enc_item_key since the user's actually key will do the encrypting once its passed off
              data.items.forEach(function(item){
                item.enc_item_key = null;
                item.auth_hash = null;
              });

              var errorCount = 0;
              // Don't import items that didn't decrypt properly
              data.items = data.items.filter(function(item){
                if(item.errorDecrypting) {
                  errorCount++;
                  return false;
                }
                return true;
              })

              onDataReady(errorCount);
            })
          }
          catch (e) {
            console.log("Error decrypting", e);
            alert("There was an error decrypting your items. Make sure the password you entered is correct and try again.");
            callback(null);
            return;
          }
        });
      } else {
        onDataReady();
      }
    }

    /*
    Export
    */

    $scope.downloadDataArchive = async function() {
      archiveManager.downloadBackup($scope.archiveFormData.encrypted);
    }

    /*
    Encryption Status
    */

    $scope.notesAndTagsCount = function() {
      var items = modelManager.allItemsMatchingTypes(["Note", "Tag"]);
      return items.length;
    }

    $scope.encryptionStatusForNotes = function() {
      var length = $scope.notesAndTagsCount();
      return length + "/" + length + " notes and tags encrypted";
    }

    $scope.encryptionEnabled = function() {
      return passcodeManager.hasPasscode() || !authManager.offline();
    }

    $scope.encryptionSource = function() {
      if(!authManager.offline()) {
        return "Account keys";
      } else if(passcodeManager.hasPasscode()) {
        return "Local Passcode";
      } else {
        return null;
      }
    }

    $scope.encryptionStatusString = function() {
      if(!authManager.offline()) {
        return "End-to-end encryption is enabled. Your data is encrypted before syncing to your private account.";
      } else if(passcodeManager.hasPasscode()) {
        return "Encryption is enabled. Your data is encrypted using your passcode before saving to your device storage.";
      } else {
        return "Encryption is not enabled. Sign in, register, or add a passcode lock to enable encryption.";
      }
    }

    /*
    Passcode Lock
    */

    $scope.passcodeAutoLockOptions = passcodeManager.getAutoLockIntervalOptions();

    $scope.reloadAutoLockInterval = function() {
       passcodeManager.getAutoLockInterval().then((interval) => {
         $timeout(() => {
           $scope.selectedAutoLockInterval = interval;
         })
       })
    }

    $scope.reloadAutoLockInterval();

    $scope.selectAutoLockInterval = async function(interval) {
      let run = async () => {
        await passcodeManager.setAutoLockInterval(interval);
        $timeout(() => {
          $scope.reloadAutoLockInterval();
        });
      }

      if(await privilegesManager.actionRequiresPrivilege(PrivilegesManager.ActionManagePasscode)) {
        privilegesManager.presentPrivilegesModal(PrivilegesManager.ActionManagePasscode, () => {
          run();
        });
      } else {
        run();
      }
    }

    $scope.hasPasscode = function() {
      return passcodeManager.hasPasscode();
    }

    $scope.addPasscodeClicked = function() {
      $scope.formData.showPasscodeForm = true;
    }

    $scope.submitPasscodeForm = function() {
      var passcode = $scope.formData.passcode;
      if(passcode !== $scope.formData.confirmPasscode) {
        alert("The two passcodes you entered do not match. Please try again.");
        return;
      }

      let fn = $scope.formData.changingPasscode ? passcodeManager.changePasscode.bind(passcodeManager) : passcodeManager.setPasscode.bind(passcodeManager);

      fn(passcode, () => {
        $timeout(() => {
          $scope.formData.passcode = null;
          $scope.formData.confirmPasscode = null;
          $scope.formData.showPasscodeForm = false;
          var offline = authManager.offline();

          if(offline) {
            // Allows desktop to make backup file
            $rootScope.$broadcast("major-data-change");
            $scope.clearDatabaseAndRewriteAllItems(false);
          }
        })
      })
    }

    $scope.changePasscodePressed = async function() {
      let run = () => {
        $timeout(() => {
          $scope.formData.changingPasscode = true;
          $scope.addPasscodeClicked();
        })
      }

      if(await privilegesManager.actionRequiresPrivilege(PrivilegesManager.ActionManagePasscode)) {
        privilegesManager.presentPrivilegesModal(PrivilegesManager.ActionManagePasscode, () => {
          run();
        });
      } else {
        run();
      }
    }

    $scope.removePasscodePressed = async function() {
      let run = () => {
        $timeout(() => {
          var signedIn = !authManager.offline();
          var message = "Are you sure you want to remove your local passcode?";
          if(!signedIn) {
            message += " This will remove encryption from your local data.";
          }
          if(confirm(message)) {
            passcodeManager.clearPasscode();

            if(authManager.offline()) {
              syncManager.markAllItemsDirtyAndSaveOffline();
              // Don't create backup here, as if the user is temporarily removing the passcode to change it,
              // we don't want to write unencrypted data to disk.
              // $rootScope.$broadcast("major-data-change");
            }
          }
        })
      }

      if(await privilegesManager.actionRequiresPrivilege(PrivilegesManager.ActionManagePasscode)) {
        privilegesManager.presentPrivilegesModal(PrivilegesManager.ActionManagePasscode, () => {
          run();
        });
      } else {
        run();
      }
    }

    $scope.isDesktopApplication = function() {
      return isDesktopApplication();
    }

  }
}

angular.module('app').directive('accountMenu', () => new AccountMenu);
;class ActionsMenu {

  constructor() {
    this.restrict = "E";
    this.templateUrl = "directives/actions-menu.html";
    this.scope = {
      item: "="
    };
  }

  controller($scope, modelManager, actionsManager) {
    'ngInject';

    $scope.extensions = actionsManager.extensions.sort((a, b) => {
      return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
    });

    for(let ext of $scope.extensions) {
      ext.loading = true;
      actionsManager.loadExtensionInContextOfItem(ext, $scope.item, function(scopedExtension) {
        ext.loading = false;
      })
    }

    $scope.executeAction = function(action, extension, parentAction) {
      if(action.verb == "nested") {
        if(!action.subrows) {
          action.subrows = $scope.subRowsForAction(action, extension);
        } else {
          action.subrows = null;
        }
        return;
      }

      action.running = true;
      actionsManager.executeAction(action, extension, $scope.item, (response, error) => {
        if(error) {
          return;
        }

        action.running = false;
        $scope.handleActionResponse(action, response);

        // reload extension actions
        actionsManager.loadExtensionInContextOfItem(extension, $scope.item, function(ext){
          // keep nested state
          // 4/1/2019: We're not going to do this anymore because we're no longer using nested actions for version history,
          // and also because finding the parentAction based on only label is not good enough. Two actions can have same label.
          // We'd need a way to track actions after they are reloaded, but there's no good way to do this.
          // if(parentAction) {
          //   var matchingAction = _.find(ext.actions, {label: parentAction.label});
          //   matchingAction.subrows = $scope.subRowsForAction(parentAction, extension);
          // }
        });
      })
    }

    $scope.handleActionResponse = function(action, response) {
      switch (action.verb) {
        case "render": {
          var item = response.item;
          actionsManager.presentRevisionPreviewModal(item.uuid, item.content);
        }
      }
    }


    $scope.subRowsForAction = function(parentAction, extension) {
      if(!parentAction.subactions) {
        return null;
      }
      return parentAction.subactions.map((subaction) => {
        return {
          onClick: () => {
            this.executeAction(subaction, extension, parentAction);
          },
          label: subaction.label,
          subtitle: subaction.desc,
          spinnerClass: subaction.running ? 'info' : null
        }
      })
    }
  }

}

angular.module('app').directive('actionsMenu', () => new ActionsMenu);
;class ComponentModal {

  constructor() {
    this.restrict = "E";
    this.templateUrl = "directives/component-modal.html";
    this.scope = {
      show: "=",
      component: "=",
      callback: "=",
      onDismiss: "&"
    };
  }

  link($scope, el, attrs) {
    $scope.el = el;
  }

  controller($scope, $timeout, componentManager) {
    'ngInject';

    $scope.dismiss = function(callback) {
      $scope.el.remove();
      $scope.$destroy();
      $scope.onDismiss && $scope.onDismiss() && $scope.onDismiss()($scope.component);
      callback && callback();
    }
  }

}

angular.module('app').directive('componentModal', () => new ComponentModal);
;class ComponentView {

  constructor($rootScope, componentManager, desktopManager, $timeout, themeManager) {
    this.restrict = "E";
    this.templateUrl = "directives/component-view.html";
    this.scope = {
      component: "=",
      onLoad: "=?",
      manualDealloc: "=?"
    };

    this.desktopManager = desktopManager;
  }

  link($scope, el, attrs, ctrl) {
    $scope.el = el;

    $scope.componentValid = true;

    $scope.updateObserver = this.desktopManager.registerUpdateObserver((component) => {
      if(component == $scope.component && component.active) {
        $scope.reloadComponent();
      }
    })

    $scope.$watch('component', function(component, prevComponent){
      ctrl.componentValueChanging(component, prevComponent);
    });
  }

  controller($scope, $rootScope, $timeout, componentManager, desktopManager, themeManager) {
    'ngInject';

    $scope.onVisibilityChange = function() {
      if(document.visibilityState == "hidden") {
        return;
      }

      if($scope.issueLoading) {
        $scope.reloadComponent();
      }
    }

    $scope.themeHandlerIdentifier = "component-view-" + Math.random();
    componentManager.registerHandler({identifier: $scope.themeHandlerIdentifier, areas: ["themes"], activationHandler: (component) => {
      $scope.reloadThemeStatus();
    }});

    $scope.identifier = "component-view-" + Math.random();

    componentManager.registerHandler({
      identifier: $scope.identifier,
      areas: [$scope.component.area],
      activationHandler: (component) => {
        if(component !== $scope.component) {
          return;
        }

        $timeout(() => {
          $scope.handleActivation();
        })
      },
      actionHandler: (component, action, data) => {
         if(action == "set-size") {
           componentManager.handleSetSizeEvent(component, data);
         }
      }
    });

    $scope.handleActivation = function() {
      // activationHandlers may be called multiple times, design below to be idempotent
      let component = $scope.component;
      if(!component.active) {
        return;
      }

      let iframe = componentManager.iframeForComponent(component);
      if(iframe) {
        $scope.loading = true;
        // begin loading error handler. If onload isn't called in x seconds, display an error
        if($scope.loadTimeout) { $timeout.cancel($scope.loadTimeout);}
        $scope.loadTimeout = $timeout(() => {
          if($scope.loading) {
            $scope.loading = false;
            $scope.issueLoading = true;

            if(!$scope.didAttemptReload) {
              $scope.didAttemptReload = true;
              $scope.reloadComponent();
            } else {
              // We'll attempt to reload when the tab gains focus
              document.addEventListener("visibilitychange", $scope.onVisibilityChange);
            }
          }
        }, 3500);
        iframe.onload = (event) => {
          let desktopError = false;
          try {
            // Accessing iframe.contentWindow.origin will throw an exception if we are in the web app, or if the iframe content
            // is remote content. The only reason it works in this case is because we're accessing a local extension.
            // In the future when the desktop app falls back to the web location if local fail loads, we won't be able to access this property anymore.
            if(isDesktopApplication() && (iframe.contentWindow.origin == null || iframe.contentWindow.origin == 'null')) {
              /*
              Don't attempt reload in this case, as it results in infinite loop, since a reload will deactivate the extension and then reactivate.
              This can cause this componentView to be dealloced and a new one to be instantiated. This happens in editor.js, which we'll need to look into.
              Don't return from this clause either, since we don't want to cancel loadTimeout (that will trigger reload). Instead, handle custom fail logic here.
              */
              desktopError = true;
            }
          } catch (e) {

          }

          $timeout.cancel($scope.loadTimeout);
          componentManager.registerComponentWindow(component, iframe.contentWindow).then(() => {
            // Add small timeout to, as $scope.loading controls loading overlay,
            // which is used to avoid flicker when enabling extensions while having an enabled theme
            // we don't use ng-show because it causes problems with rendering iframes after timeout, for some reason.
            $timeout(() => {
              $scope.loading = false;
              $scope.issueLoading = desktopError; /* Typically we'd just set this to false at this point, but we now account for desktopError */
              $scope.onLoad && $scope.onLoad($scope.component);
            }, 7)
          })

        };
      }
    }


    /*
    General note regarding activation/deactivation of components:
    We pass `true` to componentManager.ac/detivateComponent for the `dontSync` parameter.
    The activation we do in here is not global, but just local, so we don't need to sync the state.
    For example, if we activate an editor, we just need to do that for display purposes, but dont
    need to perform a sync to propagate that .active flag.
    */

    this.componentValueChanging = (component, prevComponent) => {
      //
      // See comment above about passing true to componentManager.ac/detivateComponent
      //
      if(prevComponent && component !== prevComponent) {
        // Deactive old component
        componentManager.deactivateComponent(prevComponent, true);
      }

      if(component) {
        componentManager.activateComponent(component, true);
        // console.log("Loading", $scope.component.name, $scope.getUrl(), component.valid_until);

        $scope.reloadStatus();
      }
    }

    $scope.$on("ext-reload-complete", () => {
      $scope.reloadStatus(false);
    })

    $scope.reloadComponent = function() {
      // console.log("Reloading component", $scope.component);
      // force iFrame to deinit, allows new one to be created
      $scope.componentValid = false;
      componentManager.reloadComponent($scope.component).then(() => {
        $scope.reloadStatus();
      })
    }

    $scope.reloadStatus = function(doManualReload = true) {
      let component = $scope.component;
      $scope.reloading = true;
      let previouslyValid = $scope.componentValid;

      let offlineRestricted = component.offlineOnly && !isDesktopApplication();

      let urlError =
        (!isDesktopApplication() && !component.hasValidHostedUrl())
        ||
        (isDesktopApplication() && (!component.local_url && !component.hasValidHostedUrl()))

      $scope.expired = component.valid_until && component.valid_until <= new Date();

      // Here we choose our own readonly state based on custom logic. However, if a parent
      // wants to implement their own readonly logic, they can lock it.
      if(!component.lockReadonly) {
        component.readonly = $scope.expired;
      }

      $scope.componentValid = !offlineRestricted && !urlError;

      if(!$scope.componentValid) {
        // required to disable overlay
        $scope.loading = false;
      }

      if(offlineRestricted) $scope.error = 'offline-restricted';
      else if(urlError) $scope.error = 'url-missing';
      else $scope.error = null;

      if($scope.componentValid !== previouslyValid) {
        if($scope.componentValid) {
          // We want to reload here, rather than `activateComponent`, because the component will already have attempted to been activated.
          componentManager.reloadComponent(component, true);
        }
      }

      if($scope.expired && doManualReload) {
        // Try reloading, handled by footer, which will open Extensions window momentarily to pull in latest data
        // Upon completion, this method, reloadStatus, will be called, upon where doManualReload will be false to prevent recursion.
        $rootScope.$broadcast("reload-ext-data");
      }

      $scope.reloadThemeStatus();

      $timeout(() => {
        $scope.reloading = false;
      }, 500)
    }

    $scope.reloadThemeStatus = function() {
      if(!$scope.component.acceptsThemes()) {
        if(themeManager.hasActiveTheme()) {
          if(!$scope.dismissedNoThemesMessage) {
            $scope.showNoThemesMessage = true;
          }
        } else {
          // Can be the case if we've just deactivated a theme
          $scope.showNoThemesMessage = false;
        }
      }
    }

    $scope.noThemesMessageDismiss = function() {
      $scope.showNoThemesMessage = false;
      $scope.dismissedNoThemesMessage = true;
    }

    $scope.disableActiveTheme = function() {
      themeManager.deactivateAllThemes();
      $scope.noThemesMessageDismiss();
    }

    $scope.getUrl = function() {
      var url = componentManager.urlForComponent($scope.component);
      $scope.component.runningLocally = (url == $scope.component.local_url);
      return url;
    }

    $scope.destroy = function() {
      componentManager.deregisterHandler($scope.themeHandlerIdentifier);
      componentManager.deregisterHandler($scope.identifier);
      if($scope.component && !$scope.manualDealloc) {
        componentManager.deactivateComponent($scope.component, true);
      }

      desktopManager.deregisterUpdateObserver($scope.updateObserver);
      document.removeEventListener("visibilitychange", $scope.onVisibilityChange);
    }

    $scope.$on("$destroy", function() {
      $scope.destroy();
    });
  }

}

angular.module('app').directive('componentView', ($rootScope, componentManager, desktopManager, $timeout) => new ComponentView($rootScope, componentManager, desktopManager, $timeout));
;/*
  The purpose of the conflict resoltion modal is to present two versions of a conflicted item,
  and allow the user to choose which to keep (or to keep both.)
*/

class ConflictResolutionModal {

  constructor() {
    this.restrict = "E";
    this.templateUrl = "directives/conflict-resolution-modal.html";
    this.scope = {
      item1: "=",
      item2: "=",
      callback: "="
    };
  }

  link($scope, el, attrs) {

    $scope.dismiss = function() {
      el.remove();
    }
  }

  controller($scope, modelManager, syncManager, archiveManager) {
    'ngInject';

    $scope.createContentString = function(item) {
      return JSON.stringify(
        Object.assign({created_at: item.created_at, updated_at: item.updated_at}, item.content), null, 2
      )
    }

    $scope.contentType = $scope.item1.content_type;

    $scope.item1Content = $scope.createContentString($scope.item1);
    $scope.item2Content = $scope.createContentString($scope.item2);

    $scope.keepItem1 = function() {
      if(!confirm("Are you sure you want to delete the item on the right?")) {
        return;
      }
      modelManager.setItemToBeDeleted($scope.item2);
      syncManager.sync().then(() => {
        $scope.applyCallback();
      })

      $scope.dismiss();
    }

    $scope.keepItem2 = function() {
      if(!confirm("Are you sure you want to delete the item on the left?")) {
        return;
      }
      modelManager.setItemToBeDeleted($scope.item1);
      syncManager.sync().then(() => {
        $scope.applyCallback();
      })

      $scope.dismiss();
    }

    $scope.keepBoth = function() {
      $scope.applyCallback();
      $scope.dismiss();
    }

    $scope.export = function() {
      archiveManager.downloadBackupOfItems([$scope.item1, $scope.item2], true);
    }

    $scope.applyCallback = function() {
      $scope.callback && $scope.callback();
    }

  }
}

angular.module('app').directive('conflictResolutionModal', () => new ConflictResolutionModal);
;class EditorMenu {

  constructor() {
    this.restrict = "E";
    this.templateUrl = "directives/editor-menu.html";
    this.scope = {
      callback: "&",
      selectedEditor: "=",
      currentItem: "="
    };
  }

  controller($scope, componentManager, syncManager, modelManager, $timeout) {
    'ngInject';

    $scope.formData = {};

    $scope.editors = componentManager.componentsForArea("editor-editor").sort((a, b) => {
      return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
    });

    $scope.isDesktop = isDesktopApplication();

    $scope.defaultEditor = $scope.editors.filter((e) => {return e.isDefaultEditor()})[0];

    $scope.selectComponent = function(component) {
      if(component) {
        if(component.content.conflict_of) {
          component.content.conflict_of = null; // clear conflict if applicable
          modelManager.setItemDirty(component, true);
          syncManager.sync();
        }
      }
      $timeout(() => {
        $scope.callback()(component);
      })
    }

    $scope.toggleDefaultForEditor = function(editor) {
      if($scope.defaultEditor == editor) {
        $scope.removeEditorDefault(editor);
      } else {
        $scope.makeEditorDefault(editor);
      }
    }

    $scope.offlineAvailableForComponent = function(component) {
      return component.local_url && isDesktopApplication();
    }

    $scope.makeEditorDefault = function(component) {
      var currentDefault = componentManager.componentsForArea("editor-editor").filter((e) => {return e.isDefaultEditor()})[0];
      if(currentDefault) {
        currentDefault.setAppDataItem("defaultEditor", false);
        modelManager.setItemDirty(currentDefault, true);
      }

      component.setAppDataItem("defaultEditor", true);
      modelManager.setItemDirty(component, true);
      syncManager.sync();

      $scope.defaultEditor = component;
    }

    $scope.removeEditorDefault = function(component) {
      component.setAppDataItem("defaultEditor", false);
      modelManager.setItemDirty(component, true);
      syncManager.sync();

      $scope.defaultEditor = null;
    }

    $scope.shouldDisplayRunningLocallyLabel = function(component) {
      if(!component.runningLocally) {
        return false;
      }

      if(component == $scope.selectedEditor) {
        return true;
      } else {
        return false;
      }
    }
  }

}

angular.module('app').directive('editorMenu', () => new EditorMenu);
;class InputModal {

  constructor() {
    this.restrict = "E";
    this.templateUrl = "directives/input-modal.html";
    this.scope = {
      type: "=",
      title: "=",
      message: "=",
      placeholder: "=",
      callback: "&"
    };
  }

  link($scope, el, attrs) {
    $scope.el = el;
  }

  controller($scope, modelManager, archiveManager, authManager, syncManager, $timeout) {
    'ngInject';

    $scope.formData = {};

    $scope.dismiss = function() {
      $scope.el.remove();
      $scope.$destroy();
    }

    $scope.submit = function() {
      $scope.callback()($scope.formData.input);
      $scope.dismiss();
    }


  }
}

angular.module('app').directive('inputModal', () => new InputModal);
;class MenuRow {

  constructor() {
    this.restrict = "E";
    this.transclude = true;
    this.templateUrl = "directives/menu-row.html";
    this.scope = {
      action: "&",
      circle: "=",
      circleAlign: "=",
      label: "=",
      subtitle: "=",
      hasButton: "=",
      buttonText: "=",
      buttonClass: "=",
      buttonAction: "&",
      spinnerClass: "=",
      subRows: "=",
      faded: "=",
      desc: "=",
      disabled: "=",
      stylekitClass: "="
    };
  }

  controller($scope, componentManager) {
    'ngInject';

    $scope.onClick = function($event) {
      if($scope.disabled) {
        return;
      }
      $event.stopPropagation();
      $scope.action();
    }

    // This is for the accessory button
    $scope.clickButton = function($event) {
      if($scope.disabled) {
        return;
      }
      $event.stopPropagation();
      $scope.buttonAction();
    }

  }
}

angular.module('app').directive('menuRow', () => new MenuRow);
;class PanelResizer {

  constructor() {
    this.restrict = "E";
    this.templateUrl = "directives/panel-resizer.html";
    this.scope = {
      index: "=",
      panelId: "=",
      onResize: "&",
      defaultWidth: "=",
      onResizeFinish: "&",
      control: "=",
      alwaysVisible: "=",
      minWidth: "=",
      property: "=",
      hoverable: "=",
      collapsable: "="
    };
  }

  link(scope, elem, attrs, ctrl) {
    scope.elem = elem;

    scope.control.setWidth = function(value) {
      scope.setWidth(value, true);
    }

    scope.control.setLeft = function(value) {
      scope.setLeft(value);
    }

    scope.control.flash = function() {
      scope.flash();
    }

    scope.control.isCollapsed = function() {
      return scope.isCollapsed();
    }
  }

  controller($scope, $element, modelManager, actionsManager, $timeout, $compile) {
    'ngInject';

    let panel = document.getElementById($scope.panelId);
    if(!panel) {
      console.log("Panel not found for", $scope.panelId);
    }

    let resizerColumn = $element[0];
    let resizerWidth = resizerColumn.offsetWidth;
    let minWidth = $scope.minWidth || resizerWidth;
    var pressed = false;
    var startWidth = panel.scrollWidth, startX = 0, lastDownX = 0, collapsed, lastWidth = startWidth, startLeft = panel.offsetLeft, lastLeft = startLeft;
    var appFrame;

    $scope.isAtMaxWidth = function() {
      return Math.round((lastWidth + lastLeft)) == Math.round(getParentRect().width);
    }

    $scope.isCollapsed = function() {
      return lastWidth <= minWidth;
    }

    // Handle Double Click Event
    var widthBeforeLastDblClick = 0;
    resizerColumn.ondblclick = () => {
      $timeout(() => {
        var preClickCollapseState = $scope.isCollapsed();
        if(preClickCollapseState) {
          $scope.setWidth(widthBeforeLastDblClick || $scope.defaultWidth);
        } else {
          widthBeforeLastDblClick = lastWidth;
          $scope.setWidth(minWidth);
        }

        $scope.finishSettingWidth();

        var newCollapseState = !preClickCollapseState;
        $scope.onResizeFinish()(lastWidth, lastLeft, $scope.isAtMaxWidth(), newCollapseState);
      })
    }

    function getParentRect() {
      return panel.parentNode.getBoundingClientRect();
    }

    if($scope.property == "right") {
      let handleReize = debounce((event) => {
        reloadDefaultValues();
        handleWidthEvent();
        $timeout(() => { $scope.finishSettingWidth(); })
      }, 250);

      window.addEventListener('resize', handleReize);

      $scope.$on("$destroy", function() {
        window.removeEventListener('resize', handleReize);
      });
    }

    function reloadDefaultValues() {
      startWidth = $scope.isAtMaxWidth() ? getParentRect().width : panel.scrollWidth;
      lastWidth = startWidth;
      appFrame = document.getElementById("app").getBoundingClientRect();
    }
    reloadDefaultValues();

    if($scope.alwaysVisible) {
      resizerColumn.classList.add("always-visible");
    }

    if($scope.hoverable) {
      resizerColumn.classList.add("hoverable");
    }

    $scope.setWidth = function(width, finish) {
      if(width < minWidth) {
        width = minWidth;
      }

      let parentRect = getParentRect();

      if(width > parentRect.width) {
        width = parentRect.width;
      }

      let maxWidth = appFrame.width - panel.getBoundingClientRect().x;
      if(width > maxWidth) {
        width = maxWidth;
      }

      if((Math.round(width + lastLeft)) == Math.round(parentRect.width)) {
        panel.style.width = `calc(100% - ${lastLeft}px)`;
        panel.style.flexBasis = `calc(100% - ${lastLeft}px)`;
      } else {
        panel.style.flexBasis = width + "px";
        panel.style.width = width + "px";
      }

      lastWidth = width;

      if(finish) {
        $scope.finishSettingWidth();
      }
    }

    $scope.setLeft = function(left) {
      panel.style.left = left + "px";
      lastLeft = left;
    }

    $scope.finishSettingWidth = function() {
      if(!$scope.collapsable) {
        return;
      }

      collapsed = $scope.isCollapsed();
      if(collapsed) {
        resizerColumn.classList.add("collapsed");
      } else {
        resizerColumn.classList.remove("collapsed");
      }
    }

    /*
      If an iframe is displayed adjacent to our panel, and your mouse exits over the iframe,
      document[onmouseup] is not triggered because the document is no longer the same over the iframe.
      We add an invisible overlay while resizing so that the mouse context remains in our main document.
     */
    $scope.addInvisibleOverlay = function() {
      if($scope.overlay) {
        return;
      }

      $scope.overlay = $compile("<div id='resizer-overlay'></div>")($scope);
      angular.element(document.body).prepend($scope.overlay);
    }

    $scope.removeInvisibleOverlay = function() {
      if($scope.overlay) {
        $scope.overlay.remove();
        $scope.overlay = null;
      }
    }

    $scope.flash = function() {
      resizerColumn.classList.add("animate-opacity");
      $timeout(() => {
        resizerColumn.classList.remove("animate-opacity");
      }, 3000)
    }

    resizerColumn.addEventListener("mousedown", function(event){
      $scope.addInvisibleOverlay();

      pressed = true;
      lastDownX = event.clientX;
      startWidth = panel.scrollWidth;
      startLeft = panel.offsetLeft;
      panel.classList.add("no-selection");

      if($scope.hoverable) {
        resizerColumn.classList.add("dragging");
      }
    })

    document.addEventListener("mousemove", function(event){
      if(!pressed) {
        return;
      }

      event.preventDefault();

      if($scope.property && $scope.property == 'left') {
        handleLeftEvent(event);
      } else {
        handleWidthEvent(event);
      }
    })

    function handleWidthEvent(event) {
      let x;
      if(event) {
        x = event.clientX;
      } else {
        // coming from resize event
        x = 0;
        lastDownX = 0;
      }

      let deltaX = x - lastDownX;
      var newWidth = startWidth + deltaX;

      $scope.setWidth(newWidth, false);

      if($scope.onResize()) {
        $scope.onResize()(lastWidth, panel);
      }
    }

    function handleLeftEvent(event) {
      var panelRect = panel.getBoundingClientRect();
      var x = event.clientX || panelRect.x;
      let deltaX = x - lastDownX;
      var newLeft = startLeft + deltaX;
      if(newLeft < 0) {
        newLeft = 0;
        deltaX = -startLeft;
      }

      let parentRect = getParentRect();

      var newWidth = startWidth - deltaX;
      if(newWidth < minWidth) {
        newWidth = minWidth;
      }

      if(newWidth > parentRect.width) {
        newWidth = parentRect.width;
      }


      if(newLeft + newWidth > parentRect.width) {
        newLeft = parentRect.width - newWidth;
      }

      $scope.setLeft(newLeft, false);
      $scope.setWidth(newWidth, false);
    }

    document.addEventListener("mouseup", (event) => {
      $scope.removeInvisibleOverlay();

      if(pressed) {
        pressed = false;
        resizerColumn.classList.remove("dragging");
        panel.classList.remove("no-selection");

        let isMaxWidth = $scope.isAtMaxWidth();

        if($scope.onResizeFinish) {
          $scope.onResizeFinish()(lastWidth, lastLeft, isMaxWidth, $scope.isCollapsed());
        }

        $scope.finishSettingWidth();
      }
    })
  }
}

angular.module('app').directive('panelResizer', () => new PanelResizer);

/* via https://davidwalsh.name/javascript-debounce-function */
function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};
;class PasswordWizard {

  constructor() {
    this.restrict = "E";
    this.templateUrl = "directives/password-wizard.html";
    this.scope = {
      type: "="
    };
  }

  link($scope, el, attrs) {
    $scope.el = el;
  }

  controller($scope, modelManager, archiveManager, authManager, syncManager, $timeout) {
    'ngInject';

    window.onbeforeunload = (e) => {
      // Confirms with user to close tab before closing
      return true;
    };

    $scope.$on("$destroy", function() {
      window.onbeforeunload = null;
    });

    $scope.dismiss = function() {
      if($scope.lockContinue) {
        alert("Cannot close window until pending tasks are complete.");
        return;
      }
      $scope.el.remove();
      $scope.$destroy();
    }

    $scope.syncStatus = syncManager.syncStatus;
    $scope.formData = {};

    const IntroStep = 0;
    const BackupStep = 1;
    const SignoutStep = 2;
    const PasswordStep = 3;
    const SyncStep = 4;
    const FinishStep = 5;

    let DefaultContinueTitle = "Continue";
    $scope.continueTitle = DefaultContinueTitle;

    $scope.step = IntroStep;

    $scope.titleForStep = function(step) {
      switch (step) {
        case BackupStep:
          return "Download a backup of your data";
        case SignoutStep:
          return "Sign out of all your devices";
        case PasswordStep:
          return $scope.changePassword ? "Password information" : "Enter your current password";
        case SyncStep:
          return "Encrypt and sync data with new keys";
        case FinishStep:
          return "Sign back in to your devices";
        default:
          return null;
      }
    }

    $scope.configure = function() {
      if($scope.type == "change-pw") {
        $scope.title = "Change Password";
        $scope.changePassword = true;
      } else if($scope.type == "upgrade-security") {
        $scope.title = "Security Update";
        $scope.securityUpdate = true;
      }
    }();

    $scope.continue = function() {

      if($scope.lockContinue || $scope.isContinuing) {
        return;
      }

      // isContinuing is a way to lock the continue function separate from lockContinue
      // lockContinue can be locked by other places, but isContinuing is only lockable from within this function.

      $scope.isContinuing = true;

      if($scope.step == FinishStep) {
        $scope.dismiss();
        return;
      }

      let next = () => {
        $scope.step += 1;
        $scope.initializeStep($scope.step);

        $scope.isContinuing = false;
      }

      var preprocessor = $scope.preprocessorForStep($scope.step);
      if(preprocessor) {
        preprocessor(() => {
          next();
        }, () => {
          // on fail
          $scope.isContinuing = false;
        })
      } else {
        next();
      }
    }

    $scope.downloadBackup = function(encrypted) {
      archiveManager.downloadBackup(encrypted);
    }

    $scope.preprocessorForStep = function(step) {
      if(step == PasswordStep) {
        return (onSuccess, onFail) => {
          $scope.showSpinner = true;
          $scope.continueTitle = "Generating Keys...";
          $timeout(() => {
            $scope.validateCurrentPassword((success) => {
              $scope.showSpinner = false;
              $scope.continueTitle = DefaultContinueTitle;
              if(success) {
                onSuccess();
              } else {
                onFail && onFail();
              }
            });
          })
        }
      }
    }

    let FailedSyncMessage = "There was an error re-encrypting your items. Your password was changed, but not all your items were properly re-encrypted and synced. You should try syncing again. If all else fails, you should restore your notes from backup.";

    $scope.initializeStep = function(step) {
      if(step == SyncStep) {
        $scope.lockContinue = true;
        $scope.formData.status = "Processing encryption keys...";
        $scope.formData.processing = true;

        $scope.processPasswordChange((passwordSuccess) => {
          $scope.formData.statusError = !passwordSuccess;
          $scope.formData.processing = passwordSuccess;

          if(passwordSuccess) {
            $scope.formData.status = "Encrypting and syncing data with new keys...";

            $scope.resyncData((syncSuccess) => {
              $scope.formData.statusError = !syncSuccess;
              $scope.formData.processing = !syncSuccess;
              if(syncSuccess) {
                $scope.lockContinue = false;

                if($scope.changePassword) {
                  $scope.formData.status = "Successfully changed password and synced all items.";
                } else if($scope.securityUpdate) {
                  $scope.formData.status = "Successfully performed security update and synced all items.";
                }
              } else {
                $scope.formData.status = FailedSyncMessage;
              }
            })
          } else {
            $scope.formData.status = "Unable to process your password. Please try again.";
          }
        })
      }

      else if(step == FinishStep) {
        $scope.continueTitle = "Finish";
      }
    }

    $scope.validateCurrentPassword = async function(callback) {
      let currentPassword = $scope.formData.currentPassword;
      let newPass = $scope.securityUpdate ? currentPassword : $scope.formData.newPassword;

      if(!currentPassword || currentPassword.length == 0) {
        alert("Please enter your current password.");
        callback(false);
        return;
      }

      if($scope.changePassword) {
        if(!newPass || newPass.length == 0) {
          alert("Please enter a new password.");
          callback(false);
          return;
        }

        if(newPass != $scope.formData.newPasswordConfirmation) {
          alert("Your new password does not match its confirmation.");
          $scope.formData.status = null;
          callback(false);
          return;
        }
      }

      if(!authManager.user.email) {
        alert("We don't have your email stored. Please log out then log back in to fix this issue.");
        $scope.formData.status = null;
        callback(false);
        return;
      }

      // Ensure value for current password matches what's saved
      let authParams = await authManager.getAuthParams();
      let password = $scope.formData.currentPassword;
      SFJS.crypto.computeEncryptionKeysForUser(password, authParams).then(async (keys) => {
        let success = keys.mk === (await authManager.keys()).mk;
        if(success) {
          this.currentServerPw = keys.pw;
        } else {
          alert("The current password you entered is not correct. Please try again.");
        }
        $timeout(() => callback(success));
      });
    }

    $scope.resyncData = function(callback) {
      modelManager.setAllItemsDirty();
      syncManager.sync().then((response) => {
        if(!response || response.error) {
          alert(FailedSyncMessage)
          $timeout(() => callback(false));
        } else {
          $timeout(() => callback(true));
        }
      });
    }

    $scope.processPasswordChange = async function(callback) {
      let newUserPassword = $scope.securityUpdate ? $scope.formData.currentPassword : $scope.formData.newPassword;

      let currentServerPw = this.currentServerPw;

      let results = await SFJS.crypto.generateInitialKeysAndAuthParamsForUser(authManager.user.email, newUserPassword);
      let newKeys = results.keys;
      let newAuthParams = results.authParams;

      // perform a sync beforehand to pull in any last minutes changes before we change the encryption key (and thus cant decrypt new changes)
      let syncResponse = await syncManager.sync();
      authManager.changePassword(await syncManager.getServerURL(), authManager.user.email, currentServerPw, newKeys, newAuthParams).then((response) => {
        if(response.error) {
          alert(response.error.message ? response.error.message : "There was an error changing your password. Please try again.");
          $timeout(() => callback(false));
        } else {
          $timeout(() => callback(true));
        }
      })
    }
  }

}

angular.module('app').directive('passwordWizard', () => new PasswordWizard);
;class PermissionsModal {

  constructor() {
    this.restrict = "E";
    this.templateUrl = "directives/permissions-modal.html";
    this.scope = {
      show: "=",
      component: "=",
      permissionsString: "=",
      callback: "="
    };
  }

  link($scope, el, attrs) {

    $scope.dismiss = function() {
      el.remove();
    }

    $scope.accept = function() {
      $scope.callback(true);
      $scope.dismiss();
    }

    $scope.deny = function() {
      $scope.callback(false);
      $scope.dismiss();
    }
  }

  controller($scope, modelManager) {
    'ngInject';

  }

}

angular.module('app').directive('permissionsModal', () => new PermissionsModal);
;class PrivilegesAuthModal {

  constructor() {
    this.restrict = "E";
    this.templateUrl = "directives/privileges-auth-modal.html";
    this.scope = {
      action: "=",
      onSuccess: "=",
      onCancel: "=",
    };
  }

  link($scope, el, attrs) {
    $scope.dismiss = function() {
      el.remove();
    }
  }

  controller($scope, privilegesManager, passcodeManager, authManager, $timeout) {
    'ngInject';

    $scope.authenticationParameters = {};
    $scope.sessionLengthOptions = privilegesManager.getSessionLengthOptions();

    privilegesManager.getSelectedSessionLength().then((length) => {
      $timeout(() => {
        $scope.selectedSessionLength = length;
      })
    })

    $scope.selectSessionLength = function(length) {
      $scope.selectedSessionLength = length;
    }

    privilegesManager.netCredentialsForAction($scope.action).then((credentials) => {
      $timeout(() => {
        $scope.requiredCredentials = credentials.sort();
      });
    });

    $scope.promptForCredential = function(credential) {
      return privilegesManager.displayInfoForCredential(credential).prompt;
    }

    $scope.cancel = function() {
      $scope.dismiss();
      $scope.onCancel && $scope.onCancel();
    }

    $scope.isCredentialInFailureState = function(credential) {
      if(!$scope.failedCredentials) {
        return false;
      }
      return $scope.failedCredentials.find((candidate) => {
        return candidate == credential;
      }) != null;
    }

    $scope.validate = function() {
      var failed = [];
      for(var cred of $scope.requiredCredentials) {
        var value = $scope.authenticationParameters[cred];
        if(!value || value.length == 0) {
          failed.push(cred);
        }
      }

      $scope.failedCredentials = failed;
      return failed.length == 0;
    }

    $scope.submit = function() {
      if(!$scope.validate()) {
        return;
      }
      privilegesManager.authenticateAction($scope.action, $scope.authenticationParameters).then((result) => {
        $timeout(() => {
          if(result.success) {
            privilegesManager.setSessionLength($scope.selectedSessionLength);
            $scope.onSuccess();
            $scope.dismiss();
          } else {
            $scope.failedCredentials = result.failedCredentials;
          }
        })
      })
    }

  }
}

angular.module('app').directive('privilegesAuthModal', () => new PrivilegesAuthModal);
;class PrivilegesManagementModal {

  constructor() {
    this.restrict = "E";
    this.templateUrl = "directives/privileges-management-modal.html";
    this.scope = {

    };
  }

  link($scope, el, attrs) {
    $scope.dismiss = function() {
      el.remove();
    }
  }

  controller($scope, privilegesManager, passcodeManager, authManager, $timeout) {
    'ngInject';

    $scope.dummy = {};

    $scope.hasPasscode = passcodeManager.hasPasscode();
    $scope.hasAccount = !authManager.offline();

    $scope.displayInfoForCredential = function(credential) {
      let info = privilegesManager.displayInfoForCredential(credential);
      if(credential == PrivilegesManager.CredentialLocalPasscode) {
        info["availability"] = $scope.hasPasscode;
      } else if(credential == PrivilegesManager.CredentialAccountPassword) {
        info["availability"] = $scope.hasAccount;
      } else {
        info["availability"] = true;
      }

      return info;
    }

    $scope.displayInfoForAction = function(action) {
      return privilegesManager.displayInfoForAction(action).label;
    }

    $scope.isCredentialRequiredForAction = function(action, credential) {
      if(!$scope.privileges) {
        return false;
      }
      return $scope.privileges.isCredentialRequiredForAction(action, credential);
    }

    $scope.clearSession = function() {
      privilegesManager.clearSession().then(() => {
        $scope.reloadPrivileges();
      })
    }

    $scope.reloadPrivileges = async function() {
      $scope.availableActions = privilegesManager.getAvailableActions();
      $scope.availableCredentials = privilegesManager.getAvailableCredentials();
      let sessionEndDate = await privilegesManager.getSessionExpirey();
      $scope.sessionExpirey = sessionEndDate.toLocaleString();
      $scope.sessionExpired = new Date() >= sessionEndDate;

      $scope.credentialDisplayInfo = {};
      for(let cred of $scope.availableCredentials) {
        $scope.credentialDisplayInfo[cred] = $scope.displayInfoForCredential(cred);
      }

      privilegesManager.getPrivileges().then((privs) => {
        $timeout(() => {
          $scope.privileges = privs;
        })
      })
    }

    $scope.checkboxValueChanged = function(action, credential) {
      $scope.privileges.toggleCredentialForAction(action, credential);
      privilegesManager.savePrivileges();
    }

    $scope.reloadPrivileges();

    $scope.cancel = function() {
      $scope.dismiss();
      $scope.onCancel && $scope.onCancel();
    }
  }
}

angular.module('app').directive('privilegesManagementModal', () => new PrivilegesManagementModal);
;class RevisionPreviewModal {

  constructor() {
    this.restrict = "E";
    this.templateUrl = "directives/revision-preview-modal.html";
    this.scope = {
      uuid: "=",
      content: "="
    };
  }

  link($scope, el, attrs) {
    $scope.el = el;
  }

  controller($scope, modelManager, syncManager, componentManager, $timeout) {
    'ngInject';

    $scope.dismiss = function() {
      $scope.el.remove();
      $scope.$destroy();
    }

    $scope.$on("$destroy", function() {
      if($scope.identifier) {
        componentManager.deregisterHandler($scope.identifier);
      }
    });

    $scope.note = new SFItem({content: $scope.content, content_type: "Note"});
    // Set UUID to editoForNote can find proper editor,
    // but then generate new uuid for note as not to save changes to original, if editor makes changes.
    $scope.note.uuid = $scope.uuid;
    let editorForNote = componentManager.editorForNote($scope.note);
    $scope.note.uuid = SFJS.crypto.generateUUIDSync();

    if(editorForNote) {
      // Create temporary copy, as a lot of componentManager is uuid based,
      // so might interfere with active editor. Be sure to copy only the content, as the
      // top level editor object has non-copyable properties like .window, which cannot be transfered
      let editorCopy = new SNComponent({content: editorForNote.content});
      editorCopy.readonly = true;
      editorCopy.lockReadonly = true;
      $scope.identifier = editorCopy.uuid;

      componentManager.registerHandler({identifier: $scope.identifier, areas: ["editor-editor"],
        contextRequestHandler: (component) => {
          if(component == $scope.editor) {
            return $scope.note;
          }
        },
        componentForSessionKeyHandler: (key) => {
          if(key == $scope.editor.sessionKey) {
            return $scope.editor;
          }
        }
      });

      $scope.editor = editorCopy;
    }


    $scope.restore = function(asCopy) {
      if(!asCopy && !confirm("Are you sure you want to replace the current note's contents with what you see in this preview?")) {
        return;
      }

      var item;
      if(asCopy) {
        var contentCopy = Object.assign({}, $scope.content);
        if(contentCopy.title) { contentCopy.title += " (copy)"; }
        item = modelManager.createItem({content_type: "Note", content: contentCopy});
        modelManager.addItem(item);
      } else {
        var uuid = $scope.uuid;
        item = modelManager.findItem(uuid);
        item.content = Object.assign({}, $scope.content);
        // mapResponseItemsToLocalModels is async, but we don't need to wait here.
        modelManager.mapResponseItemsToLocalModels([item], SFModelManager.MappingSourceRemoteActionRetrieved);
      }

      modelManager.setItemDirty(item, true);
      syncManager.sync();

      $scope.dismiss();
    }
  }
}

angular.module('app').directive('revisionPreviewModal', () => new RevisionPreviewModal);
;class SessionHistoryMenu {

  constructor() {
    this.restrict = "E";
    this.templateUrl = "directives/session-history-menu.html";
    this.scope = {
      item: "="
    };
  }

  controller($scope, modelManager, sessionHistory, actionsManager, $timeout) {
    'ngInject';

    $scope.diskEnabled = sessionHistory.diskEnabled;
    $scope.autoOptimize = sessionHistory.autoOptimize;

    $scope.reloadHistory = function() {
      let history = sessionHistory.historyForItem($scope.item);
      // make copy as not to sort inline
      $scope.entries = history.entries.slice(0).sort((a, b) => {
        return a.item.updated_at < b.item.updated_at ? 1 : -1;
      })
      $scope.history = history;
    }

    $scope.reloadHistory();

    $scope.openRevision = function(revision) {
      actionsManager.presentRevisionPreviewModal(revision.item.uuid, revision.item.content);
    }

    $scope.classForRevision = function(revision) {
      var vector = revision.operationVector();
      if(vector == 0) {
        return "default";
      } else if(vector == 1) {
        return "success";
      } else if(vector == -1) {
        return "danger";
      }
    }

    $scope.clearItemHistory = function() {
      if(!confirm("Are you sure you want to delete the local session history for this note?")) {
        return;
      }

      sessionHistory.clearItemHistory($scope.item).then(() => {
        $timeout(() => {
          $scope.reloadHistory();
        })
      });
    }

    $scope.clearAllHistory = function() {
      if(!confirm("Are you sure you want to delete the local session history for all notes?")) {
        return;
      }

      sessionHistory.clearAllHistory().then(() => {
        $timeout(() => {
          $scope.reloadHistory();
        })
      });
    }

    $scope.toggleDiskSaving = function() {
      if(!sessionHistory.diskEnabled) {
        if(!confirm("Are you sure you want to save history to disk? This will decrease general performance, especially as you type. You are advised to disable this feature if you experience any lagging.")){
          return;
        }
      }
      sessionHistory.toggleDiskSaving().then(() => {
        $timeout(() => {
          $scope.diskEnabled = sessionHistory.diskEnabled;
        })
      });
    }

    $scope.toggleAutoOptimize = function() {
      sessionHistory.toggleAutoOptimize().then(() => {
        $timeout(() => {
          $scope.autoOptimize = sessionHistory.autoOptimize;
        })
      });
    }

  }

}

angular.module('app').directive('sessionHistoryMenu', () => new SessionHistoryMenu);
;class SyncResolutionMenu {

  constructor() {
    this.restrict = "E";
    this.templateUrl = "directives/sync-resolution-menu.html";
    this.scope = {
      "closeFunction" : "&"
    };
  }

  controller($scope, modelManager, syncManager, archiveManager, $timeout) {
    'ngInject';

    $scope.status = {};

    $scope.close = function() {
      $timeout(() => {
        $scope.closeFunction()();
      })
    }

    $scope.downloadBackup = function(encrypted) {
      archiveManager.downloadBackup(encrypted);
      $scope.status.backupFinished = true;
    }

    $scope.skipBackup = function() {
      $scope.status.backupFinished = true;
    }

    $scope.performSyncResolution = function() {
      $scope.status.resolving = true;
      syncManager.resolveOutOfSync().then(() => {
        $scope.status.resolving = false;
        $scope.status.attemptedResolution = true;
        if(syncManager.isOutOfSync()) {
          $scope.status.fail = true;
        } else {
          $scope.status.success = true;
        }
      })
    }
  }
}

angular.module('app').directive('syncResolutionMenu', () => new SyncResolutionMenu);
