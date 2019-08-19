/**
 * 初期化時に求める引数おまとめセット
 */
export interface InitArgs {
  // ボタンクリックで切り替えるtheme名配列
  // 配列内のものを順繰りに変更する
  themeNameArray: string[];
  // テーマ変更イベントを紐付けるHTMLElement
  // 複数要素には非対応
  buttonEl: HTMLElement | null;
  // カスタムテーマボタンHTMLElement
  customButtonEl: HTMLElement | null;
  buttonCallback: Function;
  customButtonCallback: Function;
  // カスタムテーマ機能の初期値を設定する
  isDefaultCustomTheme: boolean
}
