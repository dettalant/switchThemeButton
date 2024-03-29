import { SwitchThemeButtonError } from "./error";
import { InitArgs, SwitchThemeButtonStates } from "./interfaces";

const LOCALSTORAGE_CURRENT_THEME_KEY = "stb_currentThemeName";
const LOCALSTORAGE_CUSTOM_THEME_KEY = "stb_isCustomTheme";

// 名前そのまま、テーマを変更ボタンのクラス。
export default class SwitchThemeButton {
  private themeNameArray: string[];
  private currentThemeIdx: number = 0;
  private buttonEl: HTMLElement;
  private customButtonEl: HTMLElement;
  public buttonCallback: Function = () => {};
  public customButtonCallback: Function = () => {};
  private states: SwitchThemeButtonStates = {
    isCustomTheme: false,
  };

  constructor(initArgs: InitArgs) {
    if (typeof initArgs === "undefined") {
      throw new SwitchThemeButtonError("インスタンス生成には初期化引数が必須です");
    } else if (initArgs.themeNameArray.length === 0) {
      throw new SwitchThemeButtonError("初期化引数のthemeNameArrayに有効な値が指定されていません");
    } else if (!(initArgs.buttonEl instanceof HTMLElement)) {
      throw new SwitchThemeButtonError("初期化引数のbuttonElがHTMLElementではありません");
    } else if (!(initArgs.customButtonEl instanceof HTMLElement)) {
      throw new SwitchThemeButtonError("初期化引数のcustomButtonElがHTMLElementではありません");
    }

    this.themeNameArray = initArgs.themeNameArray;
    this.buttonEl = initArgs.buttonEl;
    this.customButtonEl = initArgs.customButtonEl;

    this.defaultThemeApply();
    this.loadCustomThemeSetting(initArgs.isDefaultCustomTheme);

    // コールバック関数があれば呼び出しておく
    if (initArgs.buttonCallback !== void 0) {
      this.buttonCallback = initArgs.buttonCallback.bind(this);
    }
    this.buttonCallback();

    if (initArgs.customButtonCallback !== void 0) {
      this.customButtonCallback = initArgs.customButtonCallback.bind(this);
    }

    this.customButtonCallback();

    // テーマ変更ボタンクリック時の処理
    this.buttonEl.addEventListener("click", () => {
      // 適用テーマを変更
      this.switchThemeInOrder();

      this.buttonCallback();
    })

    // カスタムテーマボタンクリック時の処理
    this.customButtonEl.addEventListener("click", () => {
      this.isCustomTheme = !this.isCustomTheme;

      this.customButtonCallback();
    })
  }
  /**
   * 初期化引数のthemeNameArrayで指定した順番で順繰りにテーマ転換を行う
   */
  public switchThemeInOrder() {
    const bodyClassName = document.body.className;
    const themeNameArrayLen = this.themeNameArray.length;

    for (let i = 0; i < themeNameArrayLen; i++) {
      const themeName = this.themeNameArray[i];
      if (bodyClassName.indexOf(themeName) !== -1) {
        // ここから名前が一致した際の処理

        // 順繰りで次に来るテーマの番号を取得
        // forループの最終周回の場合は0番にする
        const nextThemeNum = (i + 1 === themeNameArrayLen) ? 0 : i + 1;
        this.currentThemeIdx = nextThemeNum;

        // bodyクラス名から現在テーマ名を除去して、次のテーマ名を追加する
        document.body.classList.remove(themeName);
        document.body.classList.add(this.currentThemeName);

        // localStorageに現在値を登録
        window.localStorage.setItem(LOCALSTORAGE_CURRENT_THEME_KEY, this.currentThemeName);

        // 目的を達したのでループ終了
        break;
      }
    }
  }

  public get isCustomTheme(): boolean {
    return this.states.isCustomTheme;
  }

  /**
   * setterを用いて、observeのようなことを行う
   * @param  isCustomTheme カスタムテーマ機能が有効になっているかどうかのbool
   */
  public set isCustomTheme(isCustomTheme: boolean) {
    this.states.isCustomTheme = isCustomTheme;
    if (isCustomTheme) {
      document.body.classList.add("is_custom_theme");
      window.localStorage.setItem(LOCALSTORAGE_CUSTOM_THEME_KEY, "true");
    } else {
      document.body.classList.remove("is_custom_theme");
      window.localStorage.setItem(LOCALSTORAGE_CUSTOM_THEME_KEY, "false");
    }
  }

  /**
   * 初期化時に初期テーマを設定する
   *
   * 初期テーマとして扱われる優先度
   *
   * 1. localStorageに過去の設定値が残されている
   * 2. body要素クラス名にテーマ名が書き込まれている
   * 3. themeNameArray0番
   *
   * @param  callback インスタンス生成時に外から渡されたコールバック関数
   */
  private defaultThemeApply() {
    // 初期化時に初期テーマを設定する
    const savedCurrentThemeName = window.localStorage.getItem(LOCALSTORAGE_CURRENT_THEME_KEY);

    if (savedCurrentThemeName !== null && savedCurrentThemeName !== "") {
      // localStorageに有効な値が登録されていた場合
      const savedThemeIdx = this.themeNameArray.indexOf(savedCurrentThemeName);

      if (savedThemeIdx !== -1) {
        // 保存テーマ名がテーマ名配列に登録されていた場合

        // 選択中テーマ番号を変更
        this.currentThemeIdx = savedThemeIdx;

        // いったん全てのテーマ名を除去
        this.removeThemeNameAll();

        // 選択中のテーマ名をbodyクラス名に追加する
        document.body.classList.add(this.currentThemeName);

        return;
      } else {
        // 保存中テーマ名がテーマ名配列に登録されていなかった場合

        // localStorageの保存情報を削除
        window.localStorage.setItem(LOCALSTORAGE_CURRENT_THEME_KEY, "");
      }
    }

    // 保存テーマ名がなかった、または有効な値ではなかった際の処理

    const defaultThemeIdx = this.getBodyDefaultThemeIdx();
    if (defaultThemeIdx !== -1) {
      // bodyに有効なテーマ名が登録されていた場合は、
      // その番号を選択中テーマ扱いにする
      this.currentThemeIdx = defaultThemeIdx;
    } else {
      // localStorageにもbodyにも値がなければ
      // 0番をデフォルトとして扱う
      document.body.classList.add(this.themeNameArray[0]);
    }
  }

  private loadCustomThemeSetting(isDefaultCustomTheme?: boolean) {
    // カスタムテーマボタンの設定を呼び戻す
    const savedIsCustomTheme = localStorage.getItem(LOCALSTORAGE_CUSTOM_THEME_KEY);
    if (savedIsCustomTheme !== null && savedIsCustomTheme === "true"
      || savedIsCustomTheme === null && isDefaultCustomTheme
    ) {
      this.isCustomTheme = true;
    }
  }

  /**
   * themeNameArray内の全てのテーマ名をbody要素から除去する
   */
  public removeThemeNameAll() {
    const themeNameArrayLen = this.themeNameArray.length;

    for (let i = 0; i < themeNameArrayLen; i++) {
      const themeName = this.themeNameArray[i];
      document.body.classList.remove(themeName);
    }
  }

  /**
   * body要素に初期登録されているテーマ名があるなら、
   * そのテーマのthemeNameArrayでの配列番号を返す
   *
   * 全てのテーマ名が未登録の場合、-1を返す
   *
   * @return themeNameArray配列番号または-1
   */
  public getBodyDefaultThemeIdx(): number {
    let themeIdxNum = -1;
    const themeNameArrayLen = this.themeNameArray.length;

    for (let i = 0; i < themeNameArrayLen; i++) {
      if (document.body.className.indexOf(this.themeNameArray[i]) !== -1) {
        themeIdxNum = i;
        break;
      }
    }

    return themeIdxNum;
  }

  /**
   * 現在のテーマ名を返す
   * @return 現在指定されているテーマ名
   */
  public get currentThemeName(): string {
    return this.themeNameArray[this.currentThemeIdx];
  }

  /**
   * 入力されたテーマ名から、それが現在適応されているかを返す
   * @param  themeName 判定したいテーマ名
   * @return           入力テーマ名が適用されていればtrue
   */
  public isThemeEnabledValidationFromName(themeName: string): boolean {
    return themeName === this.currentThemeName;
  }
}
