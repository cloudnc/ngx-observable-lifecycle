import { ɵComponentDef as ComponentDef, ɵDirectiveDef as DirectiveDef } from '@angular/core';
import { Observable, Subject } from 'rxjs';
export declare const hookProp: unique symbol;
export declare const hooksPatched: unique symbol;
export declare const allHooks: AllHookOptions;
declare type Writeable<T> = {
    -readonly [P in keyof T]: T[P];
};
export declare type IvyDirective<T> = Writeable<DirectiveDef<T> | ComponentDef<T>>;
export declare type DecoratedDirective<T, U> = IvyDirective<T> & {
    [hooksPatched]?: HooksType<U, boolean>;
};
export declare type LifecycleHookKey = 'onChanges' | 'onInit' | 'doCheck' | 'afterContentInit' | 'afterContentChecked' | 'afterViewInit' | 'afterViewChecked' | 'onDestroy';
declare type Hooks<T> = Pick<IvyDirective<T>, LifecycleHookKey>;
declare type AllHookOptions = Record<keyof Hooks<any>, true>;
declare type DecorateHookOptions = Partial<AllHookOptions>;
export declare type HooksType<T extends DecorateHookOptions, U> = {
    [P in keyof T]: T[P] extends true ? U : never;
};
export declare type DecoratedHooks<T> = HooksType<T, Observable<void>>;
export declare type DecoratedHooksSub<T> = HooksType<T, Subject<void>>;
export interface DecorateObservableOptions {
    hooks: DecorateHookOptions;
    incompatibleComponentError: Error;
}
/**
 * Library authors should use this to create their own decorators
 */
export declare function decorateObservableLifecycle(target: any, { hooks, incompatibleComponentError }: DecorateObservableOptions): void;
export interface GetLifecycleHooksOptions {
    missingDecoratorError: Error;
    incompatibleComponentError: Error;
}
/**
 * Library authors should use this to create their own lifecycle-aware functionality
 */
export declare function getLifecycleHooks<T extends DecorateHookOptions = {}>(classInstance: any, { incompatibleComponentError, missingDecoratorError }: GetLifecycleHooksOptions): DecoratedHooks<T>;
export declare function getObservableLifecycle<T extends DecorateHookOptions = AllHookOptions>(target: any): DecoratedHooks<T>;
export declare function ObservableLifecycle(hooks?: DecorateHookOptions): ClassDecorator;
export {};
