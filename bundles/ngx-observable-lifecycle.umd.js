(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('rxjs')) :
    typeof define === 'function' && define.amd ? define('ngx-observable-lifecycle', ['exports', 'rxjs'], factory) :
    (global = global || self, factory(global['ngx-observable-lifecycle'] = {}, global.rxjs));
}(this, (function (exports, rxjs) { 'use strict';

    var NG_COMPONENT_DEF = 'ɵcmp';
    var NG_DIRECTIVE_DEF = 'ɵdir';

    var hookProp = Symbol('ngx-observable-lifecycle-hooks');
    var hooksPatched = Symbol('ngx-observable-lifecycle-hooks-decorator');
    var allHooks = {
        onChanges: true,
        onInit: true,
        doCheck: true,
        afterContentInit: true,
        afterContentChecked: true,
        afterViewInit: true,
        afterViewChecked: true,
        onDestroy: true,
    };
    function getLinkInfo(type) {
        return type[NG_COMPONENT_DEF] || type[NG_DIRECTIVE_DEF];
    }
    function getSubjectForHook(classInstance, hook) {
        if (!classInstance[hookProp]) {
            classInstance[hookProp] = {};
        }
        var hooks = classInstance[hookProp];
        if (!hooks[hook]) {
            hooks[hook] = new rxjs.Subject();
        }
        return hooks[hook];
    }
    function closeHook(classInstance, hook) {
        var _a;
        (_a = classInstance[hookProp][hook]) === null || _a === void 0 ? void 0 : _a.complete();
        delete classInstance[hookProp][hook];
    }
    /**
     * Library authors should use this to create their own decorators
     */
    function decorateObservableLifecycle(target, _a) {
        var hooks = _a.hooks, incompatibleComponentError = _a.incompatibleComponentError;
        var _b;
        var linkInfo = getLinkInfo(target);
        if (!linkInfo) {
            throw incompatibleComponentError;
        }
        linkInfo[hooksPatched] = Object.keys(hooks).reduce(function (patched, hook) {
            // do not re-patch hooks that have already been patched
            if (patched[hook]) {
                return patched;
            }
            var originalHook = linkInfo[hook];
            linkInfo[hook] = function () {
                originalHook === null || originalHook === void 0 ? void 0 : originalHook.call(this);
                getSubjectForHook(this, hook).next();
            };
            var originalOnDestroy = linkInfo.onDestroy;
            linkInfo.onDestroy = function () {
                originalOnDestroy === null || originalOnDestroy === void 0 ? void 0 : originalOnDestroy.call(this);
                closeHook(this, hook);
            };
            patched[hook] = true;
            return patched;
        }, (_b = linkInfo[hooksPatched]) !== null && _b !== void 0 ? _b : {});
    }
    /**
     * Library authors should use this to create their own lifecycle-aware functionality
     */
    function getLifecycleHooks(classInstance, _a) {
        var incompatibleComponentError = _a.incompatibleComponentError, missingDecoratorError = _a.missingDecoratorError;
        var linkInfo = getLinkInfo(classInstance.constructor);
        if (!linkInfo) {
            throw incompatibleComponentError;
        }
        if (!linkInfo[hooksPatched]) {
            throw missingDecoratorError;
        }
        return new Proxy({}, {
            get: function (target, p) {
                return getSubjectForHook(classInstance, p).asObservable();
            },
        });
    }
    function getObservableLifecycle(target) {
        return getLifecycleHooks(target, {
            missingDecoratorError: new Error('You must decorate the component or directive with @ObservableLifecycle for getObservableLifecycle to be able to function!'),
            incompatibleComponentError: new Error("You must use getObservableLifecycle with a directive or component. This type (" + (target === null || target === void 0 ? void 0 : target.constructor.name) + ") is not compatible with getObservableLifecycle!"),
        });
    }
    function ObservableLifecycle(hooks) {
        if (hooks === void 0) { hooks = allHooks; }
        return function (target) {
            return decorateObservableLifecycle(target, {
                hooks: hooks,
                incompatibleComponentError: new Error("You must decorate a component or directive. This type (" + (target === null || target === void 0 ? void 0 : target.name) + ") is not compatible with @ObservableLifecycle!"),
            });
        };
    }

    exports.ObservableLifecycle = ObservableLifecycle;
    exports.allHooks = allHooks;
    exports.decorateObservableLifecycle = decorateObservableLifecycle;
    exports.getLifecycleHooks = getLifecycleHooks;
    exports.getObservableLifecycle = getObservableLifecycle;
    exports.hookProp = hookProp;
    exports.hooksPatched = hooksPatched;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ngx-observable-lifecycle.umd.js.map
