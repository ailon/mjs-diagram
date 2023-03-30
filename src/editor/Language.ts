export class StringSet extends Map<string, string> {}
export class LangStringSet extends Map<string, StringSet>{}
export class ModuleStringSet extends Map<string, LangStringSet> {}

export class Language {
  private stringStore: ModuleStringSet = new Map();

  public defaultLang = 'en';
  public defaultModule = 'core';

  public addStrings(module: string, lang: string, strings: StringSet | Array<[string, string]>) {
    if (!this.stringStore.has(module)) {
      this.stringStore.set(module, new Map<string, StringSet>());
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const moduleStrings = this.stringStore.get(module)!;

    const stringSet = strings instanceof StringSet ? strings : new StringSet(strings);

    moduleStrings.set(lang, stringSet);
  }

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
