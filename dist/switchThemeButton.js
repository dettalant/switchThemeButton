/*!
 *   switchThemeButton.js
 * See {@link https://github.com/dettalant/switchThemeButton}
 *
 * @author dettalant
 * @version v0.2.0
 * @license MIT License
 */
var switchThemeButton = (function () {
  'use strict';

  var SwitchThemeButtonError = function SwitchThemeButtonError(message) {
      this.message = message;
      this.name = "SwitchThemeButtonError";
  };
  SwitchThemeButtonError.prototype.toString = function toString () {
      return this.name + ": " + this.message;
  };

  // PCかスマホかを判定して、クリックイベントタイプを変化させる
  var IS_EXIST_TOUCH_EVENT = window.ontouchstart === null;
  var DEVICE_CLICK_EVENT_TYPE = (IS_EXIST_TOUCH_EVENT) ? "touchend" : "click";
  var LOCALSTORAGE_CURRENT_THEME_KEY = "stb_currentThemeName";
  var LOCALSTORAGE_CUSTOM_THEME_KEY = "stb_isCustomTheme";
  // 名前そのまま、テーマを変更ボタンのクラス。
  var SwitchThemeButton = function SwitchThemeButton(initArgs) {
      var this$1 = this;

      this.currentThemeIdx = 0;
      this.states = {
          isCustomTheme: false,
          isSwiping: false,
      };
      if (typeof initArgs === "undefined") {
          throw new SwitchThemeButtonError("インスタンス生成には初期化引数が必須です");
      }
      else if (initArgs.themeNameArray.length === 0) {
          throw new SwitchThemeButtonError("初期化引数のthemeNameArrayに有効な値が指定されていません");
      }
      else if (!(initArgs.buttonEl instanceof HTMLElement)) {
          throw new SwitchThemeButtonError("初期化引数のbuttonElがHTMLElementではありません");
      }
      else if (!(initArgs.customButtonEl instanceof HTMLElement)) {
          throw new SwitchThemeButtonError("初期化引数のcustomButtonElがHTMLElementではありません");
      }
      this.themeNameArray = initArgs.themeNameArray;
      this.buttonEl = initArgs.buttonEl;
      this.customButtonEl = initArgs.customButtonEl;
      this.defaultThemeApply();
      this.loadCustomThemeSetting(initArgs.isDefaultCustomTheme);
      // コールバック関数があれば呼び出しておく
      if (initArgs.buttonCallback !== void 0) {
          initArgs.buttonCallback.call(this);
      }
      if (initArgs.customButtonCallback !== void 0) {
          initArgs.customButtonCallback.call(this);
      }
      // テーマ変更ボタンクリック時の処理
      this.buttonEl.addEventListener(DEVICE_CLICK_EVENT_TYPE, function () {
          // buttonElに付与されるクリックイベント内容
          // スワイプを行っている場合は早期リターン
          if (this$1.states.isSwiping) {
              return;
          }
          // 適用テーマを変更
          this$1.switchThemeInOrder();
          // 初期化引数で指定されたコールバック関数が存在するならそれを呼び出す
          if (typeof initArgs.buttonCallback !== "undefined") {
              initArgs.buttonCallback.call(this$1);
          }
      });
      // カスタムテーマボタンクリック時の処理
      this.customButtonEl.addEventListener(DEVICE_CLICK_EVENT_TYPE, function () {
          if (this$1.states.isSwiping) {
              return;
          }
          this$1.isCustomTheme = !this$1.isCustomTheme;
          if (initArgs.customButtonCallback !== void 0) {
              initArgs.customButtonCallback.call(this$1);
          }
      });
      if (IS_EXIST_TOUCH_EVENT) {
          this.appendSwipeValidationEvent();
      }
  };

  var prototypeAccessors = { isCustomTheme: { configurable: true },currentThemeName: { configurable: true } };
  /**
   * 初期化引数のthemeNameArrayで指定した順番で順繰りにテーマ転換を行う
   */
  SwitchThemeButton.prototype.switchThemeInOrder = function switchThemeInOrder () {
      var bodyClassName = document.body.className;
      var themeNameArrayLen = this.themeNameArray.length;
      for (var i = 0; i < themeNameArrayLen; i++) {
          var themeName = this.themeNameArray[i];
          if (bodyClassName.indexOf(themeName) !== -1) {
              // ここから名前が一致した際の処理
              // 順繰りで次に来るテーマの番号を取得
              // forループの最終周回の場合は0番にする
              var nextThemeNum = (i + 1 === themeNameArrayLen) ? 0 : i + 1;
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
  };
  prototypeAccessors.isCustomTheme.get = function () {
      return this.states.isCustomTheme;
  };
  /**
   * setterを用いて、observeのようなことを行う
   * @param  isCustomTheme カスタムテーマ機能が有効になっているかどうかのbool
   */
  prototypeAccessors.isCustomTheme.set = function (isCustomTheme) {
      this.states.isCustomTheme = isCustomTheme;
      if (isCustomTheme) {
          document.body.classList.add("is_custom_theme");
          window.localStorage.setItem(LOCALSTORAGE_CUSTOM_THEME_KEY, "true");
      }
      else {
          document.body.classList.remove("is_custom_theme");
          window.localStorage.setItem(LOCALSTORAGE_CUSTOM_THEME_KEY, "false");
      }
  };
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
  SwitchThemeButton.prototype.defaultThemeApply = function defaultThemeApply () {
      // 初期化時に初期テーマを設定する
      var savedCurrentThemeName = window.localStorage.getItem(LOCALSTORAGE_CURRENT_THEME_KEY);
      if (savedCurrentThemeName !== null && savedCurrentThemeName !== "") {
          // localStorageに有効な値が登録されていた場合
          var savedThemeIdx = this.themeNameArray.indexOf(savedCurrentThemeName);
          if (savedThemeIdx !== -1) {
              // 保存テーマ名がテーマ名配列に登録されていた場合
              // 選択中テーマ番号を変更
              this.currentThemeIdx = savedThemeIdx;
              // いったん全てのテーマ名を除去
              this.removeThemeNameAll();
              // 選択中のテーマ名をbodyクラス名に追加する
              document.body.classList.add(this.currentThemeName);
              return;
          }
          else {
              // 保存中テーマ名がテーマ名配列に登録されていなかった場合
              // localStorageの保存情報を削除
              window.localStorage.setItem(LOCALSTORAGE_CURRENT_THEME_KEY, "");
          }
      }
      // 保存テーマ名がなかった、または有効な値ではなかった際の処理
      var defaultThemeIdx = this.getBodyDefaultThemeIdx();
      if (defaultThemeIdx !== -1) {
          // bodyに有効なテーマ名が登録されていた場合は、
          // その番号を選択中テーマ扱いにする
          this.currentThemeIdx = defaultThemeIdx;
      }
      else {
          // localStorageにもbodyにも値がなければ
          // 0番をデフォルトとして扱う
          document.body.classList.add(this.themeNameArray[0]);
      }
  };
  SwitchThemeButton.prototype.loadCustomThemeSetting = function loadCustomThemeSetting (isDefaultCustomTheme) {
      // カスタムテーマボタンの設定を呼び戻す
      var savedIsCustomTheme = localStorage.getItem(LOCALSTORAGE_CUSTOM_THEME_KEY);
      if (savedIsCustomTheme !== null && savedIsCustomTheme === "true"
          || savedIsCustomTheme === null && isDefaultCustomTheme) {
          this.isCustomTheme = true;
      }
  };
  /**
   * themeNameArray内の全てのテーマ名をbody要素から除去する
   */
  SwitchThemeButton.prototype.removeThemeNameAll = function removeThemeNameAll () {
      var themeNameArrayLen = this.themeNameArray.length;
      for (var i = 0; i < themeNameArrayLen; i++) {
          var themeName = this.themeNameArray[i];
          document.body.classList.remove(themeName);
      }
  };
  /**
   * body要素に初期登録されているテーマ名があるなら、
   * そのテーマのthemeNameArrayでの配列番号を返す
   *
   * 全てのテーマ名が未登録の場合、-1を返す
   *
   * @return themeNameArray配列番号または-1
   */
  SwitchThemeButton.prototype.getBodyDefaultThemeIdx = function getBodyDefaultThemeIdx () {
      var themeIdxNum = -1;
      var themeNameArrayLen = this.themeNameArray.length;
      for (var i = 0; i < themeNameArrayLen; i++) {
          if (document.body.className.indexOf(this.themeNameArray[i]) !== -1) {
              themeIdxNum = i;
              break;
          }
      }
      return themeIdxNum;
  };
  /**
   * swipe時にtouchendをキャンセルする処理のために、
   * swipeを行っているかを判定するイベントを追加する
   */
  SwitchThemeButton.prototype.appendSwipeValidationEvent = function appendSwipeValidationEvent () {
          var this$1 = this;

      // スマホ判定を一応行っておく
      if (IS_EXIST_TOUCH_EVENT) {
          // touchend指定時の、スワイプ判定追加記述
          // NOTE: 若干やっつけ気味
          window.addEventListener("touchstart", function () {
              this$1.states.isSwiping = false;
          });
          window.addEventListener("touchmove", function () {
              if (!this$1.states.isSwiping) {
                  // 無意味な上書きは一応避ける
                  this$1.states.isSwiping = true;
              }
          });
      }
  };
  /**
   * 現在のテーマ名を返す
   * @return 現在指定されているテーマ名
   */
  prototypeAccessors.currentThemeName.get = function () {
      return this.themeNameArray[this.currentThemeIdx];
  };
  /**
   * 入力されたテーマ名から、それが現在適応されているかを返す
   * @param  themeName 判定したいテーマ名
   * @return       入力テーマ名が適用されていればtrue
   */
  SwitchThemeButton.prototype.isThemeEnabledValidationFromName = function isThemeEnabledValidationFromName (themeName) {
      return themeName === this.currentThemeName;
  };

  Object.defineProperties( SwitchThemeButton.prototype, prototypeAccessors );

  return SwitchThemeButton;

}());
