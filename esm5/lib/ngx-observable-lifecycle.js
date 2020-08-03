import { Subject } from 'rxjs';
import { NG_COMPONENT_DEF, NG_DIRECTIVE_DEF } from './ivy-api';
export var hookProp = Symbol('ngx-observable-lifecycle-hooks');
export var hooksPatched = Symbol('ngx-observable-lifecycle-hooks-decorator');
export var allHooks = {
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
export function decorateObservableLifecycle(target, _a) {
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
export function getLifecycleHooks(classInstance, _a) {
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
export function getObservableLifecycle(target) {
    return getLifecycleHooks(target, {
        missingDecoratorError: new Error('You must decorate the component or directive with @ObservableLifecycle for getObservableLifecycle to be able to function!'),
        incompatibleComponentError: new Error("You must use getObservableLifecycle with a directive or component. This type (" + (target === null || target === void 0 ? void 0 : target.constructor.name) + ") is not compatible with getObservableLifecycle!"),
    });
}
export function ObservableLifecycle(hooks) {
    if (hooks === void 0) { hooks = allHooks; }
    return function (target) {
        return decorateObservableLifecycle(target, {
            hooks: hooks,
            incompatibleComponentError: new Error("You must decorate a component or directive. This type (" + (target === null || target === void 0 ? void 0 : target.name) + ") is not compatible with @ObservableLifecycle!"),
        });
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LW9ic2VydmFibGUtbGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmd4LW9ic2VydmFibGUtbGlmZWN5Y2xlLyIsInNvdXJjZXMiOlsibGliL25neC1vYnNlcnZhYmxlLWxpZmVjeWNsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFNQSxPQUFPLEVBQWMsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUUvRCxNQUFNLENBQUMsSUFBTSxRQUFRLEdBQWtCLE1BQU0sQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0FBQ2hGLE1BQU0sQ0FBQyxJQUFNLFlBQVksR0FBa0IsTUFBTSxDQUFDLDBDQUEwQyxDQUFDLENBQUM7QUFDOUYsTUFBTSxDQUFDLElBQU0sUUFBUSxHQUFtQjtJQUN0QyxTQUFTLEVBQUUsSUFBSTtJQUNmLE1BQU0sRUFBRSxJQUFJO0lBQ1osT0FBTyxFQUFFLElBQUk7SUFDYixnQkFBZ0IsRUFBRSxJQUFJO0lBQ3RCLG1CQUFtQixFQUFFLElBQUk7SUFDekIsYUFBYSxFQUFFLElBQUk7SUFDbkIsZ0JBQWdCLEVBQUUsSUFBSTtJQUN0QixTQUFTLEVBQUUsSUFBSTtDQUNoQixDQUFDO0FBT0YsU0FBUyxXQUFXLENBQU8sSUFBeUM7SUFDbEUsT0FBUSxJQUF5QixDQUFDLGdCQUFnQixDQUFDLElBQUssSUFBeUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ3RHLENBQUM7QUErQkQsU0FBUyxpQkFBaUIsQ0FBSSxhQUF3QyxFQUFFLElBQWE7SUFDbkYsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsRUFBRTtRQUM1QixhQUFhLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBZ0QsQ0FBQztLQUM1RTtJQUVELElBQU0sS0FBSyxHQUF5QixhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFNUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUNmLEtBQUssQ0FBQyxJQUFJLENBQW1CLEdBQUcsSUFBSSxPQUFPLEVBQVEsQ0FBQztLQUN0RDtJQUVELE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JCLENBQUM7QUFFRCxTQUFTLFNBQVMsQ0FBSSxhQUF3QyxFQUFFLElBQWE7O0lBQzNFLE1BQUEsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQywwQ0FBRSxRQUFRLEdBQUc7SUFDMUMsT0FBTyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdkMsQ0FBQztBQUVEOztHQUVHO0FBQ0gsTUFBTSxVQUFVLDJCQUEyQixDQUN6QyxNQUFXLEVBQ1gsRUFBZ0U7UUFBOUQsZ0JBQUssRUFBRSwwREFBMEI7O0lBRW5DLElBQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQyxNQUFhLENBQUMsQ0FBQztJQUU1QyxJQUFJLENBQUMsUUFBUSxFQUFFO1FBQ2IsTUFBTSwwQkFBMEIsQ0FBQztLQUNsQztJQUVELFFBQVEsQ0FBQyxZQUFZLENBQUMsR0FBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBNkIsQ0FBQyxNQUFNLENBQzdFLFVBQUMsT0FBZ0MsRUFBRSxJQUFJO1FBQ3JDLHVEQUF1RDtRQUN2RCxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNqQixPQUFPLE9BQU8sQ0FBQztTQUNoQjtRQUVELElBQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVwQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUc7WUFDZixZQUFZLGFBQVosWUFBWSx1QkFBWixZQUFZLENBQUUsSUFBSSxDQUFDLElBQUksRUFBRTtZQUN6QixpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDdkMsQ0FBQyxDQUFDO1FBRUYsSUFBTSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDO1FBQzdDLFFBQVEsQ0FBQyxTQUFTLEdBQUc7WUFDbkIsaUJBQWlCLGFBQWpCLGlCQUFpQix1QkFBakIsaUJBQWlCLENBQUUsSUFBSSxDQUFDLElBQUksRUFBRTtZQUM5QixTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3hCLENBQUMsQ0FBQztRQUVGLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDckIsT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQyxRQUNELFFBQVEsQ0FBQyxZQUFZLENBQUMsbUNBQUssRUFBOEIsQ0FDMUQsQ0FBQztBQUNKLENBQUM7QUFPRDs7R0FFRztBQUNILE1BQU0sVUFBVSxpQkFBaUIsQ0FDL0IsYUFBa0IsRUFDbEIsRUFBK0U7UUFBN0UsMERBQTBCLEVBQUUsZ0RBQXFCO0lBRW5ELElBQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUM7SUFFeEQsSUFBSSxDQUFDLFFBQVEsRUFBRTtRQUNiLE1BQU0sMEJBQTBCLENBQUM7S0FDbEM7SUFFRCxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFO1FBQzNCLE1BQU0scUJBQXFCLENBQUM7S0FDN0I7SUFFRCxPQUFPLElBQUksS0FBSyxDQUFDLEVBQXVCLEVBQUU7UUFDeEMsR0FBRyxFQUFILFVBQUksTUFBeUIsRUFBRSxDQUFVO1lBQ3ZDLE9BQU8saUJBQWlCLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQzVELENBQUM7S0FDRixDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQsTUFBTSxVQUFVLHNCQUFzQixDQUFpRCxNQUFXO0lBQ2hHLE9BQU8saUJBQWlCLENBQUMsTUFBTSxFQUFFO1FBQy9CLHFCQUFxQixFQUFFLElBQUksS0FBSyxDQUM5QiwySEFBMkgsQ0FDNUg7UUFDRCwwQkFBMEIsRUFBRSxJQUFJLEtBQUssQ0FDbkMsb0ZBQWlGLE1BQU0sYUFBTixNQUFNLHVCQUFOLE1BQU0sQ0FBRSxXQUFXLENBQUMsSUFBSSxzREFBa0QsQ0FDNUo7S0FDRixDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQsTUFBTSxVQUFVLG1CQUFtQixDQUFDLEtBQXFDO0lBQXJDLHNCQUFBLEVBQUEsZ0JBQXFDO0lBQ3ZFLE9BQU8sVUFBQSxNQUFNO1FBQ1gsT0FBQSwyQkFBMkIsQ0FBQyxNQUFNLEVBQUU7WUFDbEMsS0FBSyxPQUFBO1lBQ0wsMEJBQTBCLEVBQUUsSUFBSSxLQUFLLENBQ25DLDZEQUEwRCxNQUFNLGFBQU4sTUFBTSx1QkFBTixNQUFNLENBQUUsSUFBSSxvREFBZ0QsQ0FDdkg7U0FDRixDQUFDO0lBTEYsQ0FLRSxDQUFDO0FBQ1AsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIMm1Q29tcG9uZW50RGVmIGFzIENvbXBvbmVudERlZixcbiAgybVDb21wb25lbnRUeXBlIGFzIENvbXBvbmVudFR5cGUsXG4gIMm1RGlyZWN0aXZlRGVmIGFzIERpcmVjdGl2ZURlZixcbiAgybVEaXJlY3RpdmVUeXBlIGFzIERpcmVjdGl2ZVR5cGUsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgTkdfQ09NUE9ORU5UX0RFRiwgTkdfRElSRUNUSVZFX0RFRiB9IGZyb20gJy4vaXZ5LWFwaSc7XG5cbmV4cG9ydCBjb25zdCBob29rUHJvcDogdW5pcXVlIHN5bWJvbCA9IFN5bWJvbCgnbmd4LW9ic2VydmFibGUtbGlmZWN5Y2xlLWhvb2tzJyk7XG5leHBvcnQgY29uc3QgaG9va3NQYXRjaGVkOiB1bmlxdWUgc3ltYm9sID0gU3ltYm9sKCduZ3gtb2JzZXJ2YWJsZS1saWZlY3ljbGUtaG9va3MtZGVjb3JhdG9yJyk7XG5leHBvcnQgY29uc3QgYWxsSG9va3M6IEFsbEhvb2tPcHRpb25zID0ge1xuICBvbkNoYW5nZXM6IHRydWUsXG4gIG9uSW5pdDogdHJ1ZSxcbiAgZG9DaGVjazogdHJ1ZSxcbiAgYWZ0ZXJDb250ZW50SW5pdDogdHJ1ZSxcbiAgYWZ0ZXJDb250ZW50Q2hlY2tlZDogdHJ1ZSxcbiAgYWZ0ZXJWaWV3SW5pdDogdHJ1ZSxcbiAgYWZ0ZXJWaWV3Q2hlY2tlZDogdHJ1ZSxcbiAgb25EZXN0cm95OiB0cnVlLFxufTtcblxudHlwZSBXcml0ZWFibGU8VD4gPSB7IC1yZWFkb25seSBbUCBpbiBrZXlvZiBUXTogVFtQXSB9O1xuXG5leHBvcnQgdHlwZSBJdnlEaXJlY3RpdmU8VD4gPSBXcml0ZWFibGU8RGlyZWN0aXZlRGVmPFQ+IHwgQ29tcG9uZW50RGVmPFQ+PjtcbmV4cG9ydCB0eXBlIERlY29yYXRlZERpcmVjdGl2ZTxULCBVPiA9IEl2eURpcmVjdGl2ZTxUPiAmIHsgW2hvb2tzUGF0Y2hlZF0/OiBIb29rc1R5cGU8VSwgYm9vbGVhbj4gfTtcblxuZnVuY3Rpb24gZ2V0TGlua0luZm88VCwgVT4odHlwZTogRGlyZWN0aXZlVHlwZTxUPiB8IENvbXBvbmVudFR5cGU8VD4pOiBEZWNvcmF0ZWREaXJlY3RpdmU8VCwgVT4ge1xuICByZXR1cm4gKHR5cGUgYXMgQ29tcG9uZW50VHlwZTxUPilbTkdfQ09NUE9ORU5UX0RFRl0gfHwgKHR5cGUgYXMgRGlyZWN0aXZlVHlwZTxUPilbTkdfRElSRUNUSVZFX0RFRl07XG59XG5cbmV4cG9ydCB0eXBlIExpZmVjeWNsZUhvb2tLZXkgPVxuICB8ICdvbkNoYW5nZXMnXG4gIHwgJ29uSW5pdCdcbiAgfCAnZG9DaGVjaydcbiAgfCAnYWZ0ZXJDb250ZW50SW5pdCdcbiAgfCAnYWZ0ZXJDb250ZW50Q2hlY2tlZCdcbiAgfCAnYWZ0ZXJWaWV3SW5pdCdcbiAgfCAnYWZ0ZXJWaWV3Q2hlY2tlZCdcbiAgfCAnb25EZXN0cm95JztcblxudHlwZSBIb29rczxUPiA9IFBpY2s8SXZ5RGlyZWN0aXZlPFQ+LCBMaWZlY3ljbGVIb29rS2V5PjtcblxudHlwZSBBbGxIb29rT3B0aW9ucyA9IFJlY29yZDxrZXlvZiBIb29rczxhbnk+LCB0cnVlPjtcbnR5cGUgRGVjb3JhdGVIb29rT3B0aW9ucyA9IFBhcnRpYWw8QWxsSG9va09wdGlvbnM+O1xuXG5leHBvcnQgdHlwZSBIb29rc1R5cGU8VCBleHRlbmRzIERlY29yYXRlSG9va09wdGlvbnMsIFU+ID0ge1xuICBbUCBpbiBrZXlvZiBUXTogVFtQXSBleHRlbmRzIHRydWUgPyBVIDogbmV2ZXI7XG59O1xuXG5leHBvcnQgdHlwZSBEZWNvcmF0ZWRIb29rczxUPiA9IEhvb2tzVHlwZTxULCBPYnNlcnZhYmxlPHZvaWQ+PjtcbmV4cG9ydCB0eXBlIERlY29yYXRlZEhvb2tzU3ViPFQ+ID0gSG9va3NUeXBlPFQsIFN1YmplY3Q8dm9pZD4+O1xuXG5leHBvcnQgaW50ZXJmYWNlIERlY29yYXRlT2JzZXJ2YWJsZU9wdGlvbnMge1xuICBob29rczogRGVjb3JhdGVIb29rT3B0aW9ucztcbiAgaW5jb21wYXRpYmxlQ29tcG9uZW50RXJyb3I6IEVycm9yO1xufVxuXG50eXBlIERlY29yYXRlZENsYXNzSW5zdGFuY2U8VD4gPSB7IFtob29rUHJvcF06IERlY29yYXRlZEhvb2tzU3ViPFQ+IH07XG5cbmZ1bmN0aW9uIGdldFN1YmplY3RGb3JIb29rPFQ+KGNsYXNzSW5zdGFuY2U6IERlY29yYXRlZENsYXNzSW5zdGFuY2U8VD4sIGhvb2s6IGtleW9mIFQpOiBTdWJqZWN0PHZvaWQ+IHtcbiAgaWYgKCFjbGFzc0luc3RhbmNlW2hvb2tQcm9wXSkge1xuICAgIGNsYXNzSW5zdGFuY2VbaG9va1Byb3BdID0ge30gYXMgRGVjb3JhdGVkQ2xhc3NJbnN0YW5jZTxUPlt0eXBlb2YgaG9va1Byb3BdO1xuICB9XG5cbiAgY29uc3QgaG9va3M6IERlY29yYXRlZEhvb2tzU3ViPFQ+ID0gY2xhc3NJbnN0YW5jZVtob29rUHJvcF07XG5cbiAgaWYgKCFob29rc1tob29rXSkge1xuICAgIChob29rc1tob29rXSBhcyBTdWJqZWN0PHZvaWQ+KSA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG4gIH1cblxuICByZXR1cm4gaG9va3NbaG9va107XG59XG5cbmZ1bmN0aW9uIGNsb3NlSG9vazxUPihjbGFzc0luc3RhbmNlOiBEZWNvcmF0ZWRDbGFzc0luc3RhbmNlPFQ+LCBob29rOiBrZXlvZiBUKTogdm9pZCB7XG4gIGNsYXNzSW5zdGFuY2VbaG9va1Byb3BdW2hvb2tdPy5jb21wbGV0ZSgpO1xuICBkZWxldGUgY2xhc3NJbnN0YW5jZVtob29rUHJvcF1baG9va107XG59XG5cbi8qKlxuICogTGlicmFyeSBhdXRob3JzIHNob3VsZCB1c2UgdGhpcyB0byBjcmVhdGUgdGhlaXIgb3duIGRlY29yYXRvcnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlY29yYXRlT2JzZXJ2YWJsZUxpZmVjeWNsZShcbiAgdGFyZ2V0OiBhbnksXG4gIHsgaG9va3MsIGluY29tcGF0aWJsZUNvbXBvbmVudEVycm9yIH06IERlY29yYXRlT2JzZXJ2YWJsZU9wdGlvbnMsXG4pOiB2b2lkIHtcbiAgY29uc3QgbGlua0luZm8gPSBnZXRMaW5rSW5mbyh0YXJnZXQgYXMgYW55KTtcblxuICBpZiAoIWxpbmtJbmZvKSB7XG4gICAgdGhyb3cgaW5jb21wYXRpYmxlQ29tcG9uZW50RXJyb3I7XG4gIH1cblxuICBsaW5rSW5mb1tob29rc1BhdGNoZWRdID0gKE9iamVjdC5rZXlzKGhvb2tzKSBhcyBBcnJheTxMaWZlY3ljbGVIb29rS2V5PikucmVkdWNlKFxuICAgIChwYXRjaGVkOiBIb29rc1R5cGU8YW55LCBib29sZWFuPiwgaG9vaykgPT4ge1xuICAgICAgLy8gZG8gbm90IHJlLXBhdGNoIGhvb2tzIHRoYXQgaGF2ZSBhbHJlYWR5IGJlZW4gcGF0Y2hlZFxuICAgICAgaWYgKHBhdGNoZWRbaG9va10pIHtcbiAgICAgICAgcmV0dXJuIHBhdGNoZWQ7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG9yaWdpbmFsSG9vayA9IGxpbmtJbmZvW2hvb2tdO1xuXG4gICAgICBsaW5rSW5mb1tob29rXSA9IGZ1bmN0aW9uICh0aGlzOiBEZWNvcmF0ZWRDbGFzc0luc3RhbmNlPGFueT4pIHtcbiAgICAgICAgb3JpZ2luYWxIb29rPy5jYWxsKHRoaXMpO1xuICAgICAgICBnZXRTdWJqZWN0Rm9ySG9vayh0aGlzLCBob29rKS5uZXh0KCk7XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBvcmlnaW5hbE9uRGVzdHJveSA9IGxpbmtJbmZvLm9uRGVzdHJveTtcbiAgICAgIGxpbmtJbmZvLm9uRGVzdHJveSA9IGZ1bmN0aW9uICh0aGlzOiBEZWNvcmF0ZWRDbGFzc0luc3RhbmNlPGFueT4pIHtcbiAgICAgICAgb3JpZ2luYWxPbkRlc3Ryb3k/LmNhbGwodGhpcyk7XG4gICAgICAgIGNsb3NlSG9vayh0aGlzLCBob29rKTtcbiAgICAgIH07XG5cbiAgICAgIHBhdGNoZWRbaG9va10gPSB0cnVlO1xuICAgICAgcmV0dXJuIHBhdGNoZWQ7XG4gICAgfSxcbiAgICBsaW5rSW5mb1tob29rc1BhdGNoZWRdID8/ICh7fSBhcyBIb29rc1R5cGU8YW55LCBib29sZWFuPiksXG4gICk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgR2V0TGlmZWN5Y2xlSG9va3NPcHRpb25zIHtcbiAgbWlzc2luZ0RlY29yYXRvckVycm9yOiBFcnJvcjtcbiAgaW5jb21wYXRpYmxlQ29tcG9uZW50RXJyb3I6IEVycm9yO1xufVxuXG4vKipcbiAqIExpYnJhcnkgYXV0aG9ycyBzaG91bGQgdXNlIHRoaXMgdG8gY3JlYXRlIHRoZWlyIG93biBsaWZlY3ljbGUtYXdhcmUgZnVuY3Rpb25hbGl0eVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TGlmZWN5Y2xlSG9va3M8VCBleHRlbmRzIERlY29yYXRlSG9va09wdGlvbnMgPSB7fT4oXG4gIGNsYXNzSW5zdGFuY2U6IGFueSxcbiAgeyBpbmNvbXBhdGlibGVDb21wb25lbnRFcnJvciwgbWlzc2luZ0RlY29yYXRvckVycm9yIH06IEdldExpZmVjeWNsZUhvb2tzT3B0aW9ucyxcbik6IERlY29yYXRlZEhvb2tzPFQ+IHtcbiAgY29uc3QgbGlua0luZm8gPSBnZXRMaW5rSW5mbyhjbGFzc0luc3RhbmNlLmNvbnN0cnVjdG9yKTtcblxuICBpZiAoIWxpbmtJbmZvKSB7XG4gICAgdGhyb3cgaW5jb21wYXRpYmxlQ29tcG9uZW50RXJyb3I7XG4gIH1cblxuICBpZiAoIWxpbmtJbmZvW2hvb2tzUGF0Y2hlZF0pIHtcbiAgICB0aHJvdyBtaXNzaW5nRGVjb3JhdG9yRXJyb3I7XG4gIH1cblxuICByZXR1cm4gbmV3IFByb3h5KHt9IGFzIERlY29yYXRlZEhvb2tzPFQ+LCB7XG4gICAgZ2V0KHRhcmdldDogRGVjb3JhdGVkSG9va3M8VD4sIHA6IGtleW9mIFQpOiBPYnNlcnZhYmxlPHZvaWQ+IHtcbiAgICAgIHJldHVybiBnZXRTdWJqZWN0Rm9ySG9vayhjbGFzc0luc3RhbmNlLCBwKS5hc09ic2VydmFibGUoKTtcbiAgICB9LFxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE9ic2VydmFibGVMaWZlY3ljbGU8VCBleHRlbmRzIERlY29yYXRlSG9va09wdGlvbnMgPSBBbGxIb29rT3B0aW9ucz4odGFyZ2V0OiBhbnkpOiBEZWNvcmF0ZWRIb29rczxUPiB7XG4gIHJldHVybiBnZXRMaWZlY3ljbGVIb29rcyh0YXJnZXQsIHtcbiAgICBtaXNzaW5nRGVjb3JhdG9yRXJyb3I6IG5ldyBFcnJvcihcbiAgICAgICdZb3UgbXVzdCBkZWNvcmF0ZSB0aGUgY29tcG9uZW50IG9yIGRpcmVjdGl2ZSB3aXRoIEBPYnNlcnZhYmxlTGlmZWN5Y2xlIGZvciBnZXRPYnNlcnZhYmxlTGlmZWN5Y2xlIHRvIGJlIGFibGUgdG8gZnVuY3Rpb24hJyxcbiAgICApLFxuICAgIGluY29tcGF0aWJsZUNvbXBvbmVudEVycm9yOiBuZXcgRXJyb3IoXG4gICAgICBgWW91IG11c3QgdXNlIGdldE9ic2VydmFibGVMaWZlY3ljbGUgd2l0aCBhIGRpcmVjdGl2ZSBvciBjb21wb25lbnQuIFRoaXMgdHlwZSAoJHt0YXJnZXQ/LmNvbnN0cnVjdG9yLm5hbWV9KSBpcyBub3QgY29tcGF0aWJsZSB3aXRoIGdldE9ic2VydmFibGVMaWZlY3ljbGUhYCxcbiAgICApLFxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIE9ic2VydmFibGVMaWZlY3ljbGUoaG9va3M6IERlY29yYXRlSG9va09wdGlvbnMgPSBhbGxIb29rcyk6IENsYXNzRGVjb3JhdG9yIHtcbiAgcmV0dXJuIHRhcmdldCA9PlxuICAgIGRlY29yYXRlT2JzZXJ2YWJsZUxpZmVjeWNsZSh0YXJnZXQsIHtcbiAgICAgIGhvb2tzLFxuICAgICAgaW5jb21wYXRpYmxlQ29tcG9uZW50RXJyb3I6IG5ldyBFcnJvcihcbiAgICAgICAgYFlvdSBtdXN0IGRlY29yYXRlIGEgY29tcG9uZW50IG9yIGRpcmVjdGl2ZS4gVGhpcyB0eXBlICgke3RhcmdldD8ubmFtZX0pIGlzIG5vdCBjb21wYXRpYmxlIHdpdGggQE9ic2VydmFibGVMaWZlY3ljbGUhYCxcbiAgICAgICksXG4gICAgfSk7XG59XG4iXX0=