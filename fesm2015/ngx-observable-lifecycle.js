import { Subject } from 'rxjs';

const NG_COMPONENT_DEF = 'ɵcmp';
const NG_DIRECTIVE_DEF = 'ɵdir';

const hookProp = Symbol('ngx-observable-lifecycle-hooks');
const hooksPatched = Symbol('ngx-observable-lifecycle-hooks-decorator');
const allHooks = {
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
    const hooks = classInstance[hookProp];
    if (!hooks[hook]) {
        hooks[hook] = new Subject();
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
function decorateObservableLifecycle(target, { hooks, incompatibleComponentError }) {
    var _a;
    const linkInfo = getLinkInfo(target);
    if (!linkInfo) {
        throw incompatibleComponentError;
    }
    linkInfo[hooksPatched] = Object.keys(hooks).reduce((patched, hook) => {
        // do not re-patch hooks that have already been patched
        if (patched[hook]) {
            return patched;
        }
        const originalHook = linkInfo[hook];
        linkInfo[hook] = function () {
            originalHook === null || originalHook === void 0 ? void 0 : originalHook.call(this);
            getSubjectForHook(this, hook).next();
        };
        const originalOnDestroy = linkInfo.onDestroy;
        linkInfo.onDestroy = function () {
            originalOnDestroy === null || originalOnDestroy === void 0 ? void 0 : originalOnDestroy.call(this);
            closeHook(this, hook);
        };
        patched[hook] = true;
        return patched;
    }, (_a = linkInfo[hooksPatched]) !== null && _a !== void 0 ? _a : {});
}
/**
 * Library authors should use this to create their own lifecycle-aware functionality
 */
function getLifecycleHooks(classInstance, { incompatibleComponentError, missingDecoratorError }) {
    const linkInfo = getLinkInfo(classInstance.constructor);
    if (!linkInfo) {
        throw incompatibleComponentError;
    }
    if (!linkInfo[hooksPatched]) {
        throw missingDecoratorError;
    }
    return new Proxy({}, {
        get(target, p) {
            return getSubjectForHook(classInstance, p).asObservable();
        },
    });
}
function getObservableLifecycle(target) {
    return getLifecycleHooks(target, {
        missingDecoratorError: new Error('You must decorate the component or directive with @ObservableLifecycle for getObservableLifecycle to be able to function!'),
        incompatibleComponentError: new Error(`You must use getObservableLifecycle with a directive or component. This type (${target === null || target === void 0 ? void 0 : target.constructor.name}) is not compatible with getObservableLifecycle!`),
    });
}
function ObservableLifecycle(hooks = allHooks) {
    return target => decorateObservableLifecycle(target, {
        hooks,
        incompatibleComponentError: new Error(`You must decorate a component or directive. This type (${target === null || target === void 0 ? void 0 : target.name}) is not compatible with @ObservableLifecycle!`),
    });
}

/*
 * Public API Surface of ngx-observable-lifecycle
 */

/**
 * Generated bundle index. Do not edit.
 */

export { ObservableLifecycle, allHooks, decorateObservableLifecycle, getLifecycleHooks, getObservableLifecycle, hookProp, hooksPatched };
//# sourceMappingURL=ngx-observable-lifecycle.js.map
