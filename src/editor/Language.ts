/**
 * String name value pairs.
 */
export class StringSet extends Map<string, string> {}
/**
 * Collection of string sets by language.
 */
export class LangStringSet extends Map<string, StringSet>{}
/**
 * Collection of language strings for a module.
 */
export class ModuleStringSet extends Map<string, LangStringSet> {}

/**
 * Simple language (localization) subsystem.
 */
export class Language {
  private stringStore: ModuleStringSet = new Map();

  /**
   * Default language.
   * 
   * Used when strings are requested without specifying a language.
   */
  public defaultLang = 'en';
  /**
   * Default module name.
   * 
   * Used when strings are requested without specifying a module.
   */
  public defaultModule = 'core';

  /**
   * Add strings for a module and language.
   * @param module module name.
   * @param lang language identifier.
   * @param strings string setting values.
   */
  public addStrings(module: string, lang: string, strings: StringSet | Array<[string, string]>) {
    if (!this.stringStore.has(module)) {
      this.stringStore.set(module, new Map<string, StringSet>());
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const moduleStrings = this.stringStore.get(module)!;

    const stringSet = strings instanceof StringSet ? strings : new StringSet(strings);

    moduleStrings.set(lang, stringSet);
  }

  /**
   * Gets a string for specified key, module and language.
   * @param key identifier of the string.
   * @param module module name.
   * @param lang language identifier.
   * @returns localized string.
   */
  public getString(
    key: string,
    module?: string,
    lang?: string
  ): string | undefined {
    let result = this.stringStore
      .get(module ?? this.defaultModule)
      ?.get(lang ?? this.defaultLang)
      ?.get(key);
    if (result === undefined && lang !== undefined) {
      result = this.stringStore
        .get(module ?? this.defaultModule)
        ?.get(this.defaultLang)
        ?.get(key);
    }
    if (result === undefined) {
      result = this.stringStore
        .get(module ?? this.defaultModule)
        ?.get('en')
        ?.get(key);
    }
    return result;
  }
}
