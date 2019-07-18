const LIGHT_THEME_LOGO_SRC = "https://blog-imgs-107.fc2.com/d/e/t/dettalant/straw_man_big_logo_light.png";
const LIGHT_THEME_LOGO_BANNER_SRC = "https://blog-imgs-107.fc2.com/d/e/t/dettalant/straw_man_banner_logo_light.png";

const DARK_THEME_LOGO_SRC = "https://blog-imgs-107.fc2.com/d/e/t/dettalant/straw_man_big_logo_dark.png";
const DARK_THEME_LOGO_BANNER_SRC = "https://blog-imgs-107.fc2.com/d/e/t/dettalant/straw_man_banner_logo_dark.png";

const siteLogoImg = document.getElementsByClassName("site_logo");
const siteLogoBannerImg = document.getElementsByClassName("site_logo_banner");

const isLightTheme = (): boolean => {
  return document.body.className.indexOf("theme_light") !== -1
}

const changeAllLogoColor = (isLightTheme: boolean) => {
  const changeLogoColor = (elArray: HTMLCollectionOf<Element>, logoType: string, isLightTheme: boolean) => {
    let logoSrc = LIGHT_THEME_LOGO_SRC;
    if (logoType === "banner" && isLightTheme) {
      logoSrc = LIGHT_THEME_LOGO_BANNER_SRC;
    } else if (logoType === "banner" && !isLightTheme) {
      logoSrc = DARK_THEME_LOGO_BANNER_SRC;
    } else if (!isLightTheme) {
      logoSrc = DARK_THEME_LOGO_SRC;
    }

    const elArrayLen = elArray.length;

    for (let i = 0; i < elArrayLen; i++) {
      const imgEl = elArray[i];
      if (imgEl instanceof HTMLImageElement) {
        imgEl.src = logoSrc;
      }
    }
  };

  changeLogoColor(siteLogoImg, "big_logo", isLightTheme);
  changeLogoColor(siteLogoBannerImg, "banner", isLightTheme);
}

const themeChangeHandler = () => {
  if (isLightTheme()) {
    document.body.classList.remove("theme_light");
    document.body.classList.add("theme_dark");
  } else {
    document.body.classList.remove("theme_dark");
    document.body.classList.add("theme_light");
  }

  changeAllLogoColor(isLightTheme());
}

// const setSVGIconPath = (pathEl: Element) => {
//   if (!(pathEl instanceof SVGPathElement)) {
//     return;
//   }
//
//   if (isLightTheme()) {
//     // create svg path element
//     pathEl.setAttribute("d", "M20 15.31L23.31 12 20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z");
//     pathEl.setAttribute("fill", "#333");
//   } else {
//     pathEl.setAttribute("d", "M10 2c-1.82 0-3.53.5-5 1.35C7.99 5.08 10 8.3 10 12s-2.01 6.92-5 8.65C6.47 21.5 8.18 22 10 22c5.52 0 10-4.48 10-10S15.52 2 10 2z");
//     pathEl.setAttribute("fill", "#fafafa");
//   }
// }

// const createSvgIcon = (): SVGElement => {
//   // XML namespace
//   const NAMESPACE = "http://www.w3.org/2000/svg";
//   // create svg element
//
//   const svgEl = document.createElementNS(NAMESPACE,"svg");
//   svgEl.setAttribute("viewBox", "0 0 24 24");
//   svgEl.setAttribute("class", "svg_icon icon_theme_change");
//   svgEl.setAttribute("role", "img");
//
//   // create svg title element
//   const titleEl = document.createElementNS(NAMESPACE,"title");
//   titleEl.textContent = "サイトテーマを変更する";
//   svgEl.appendChild(titleEl);
//
//   const pathEl = document.createElementNS(NAMESPACE,"path");
//   pathEl.setAttribute("class", "svg_main_color");
//   setSVGIconPath(pathEl);
//   svgEl.appendChild(pathEl);
//
//   return svgEl;
// }

const toggleThemeButtonInit = (buttonElId: string) => {
  const buttonEl = document.getElementById(buttonElId)
  if (buttonEl === null) {
    return;
  }

  buttonEl.addEventListener("click", () => {
    themeChangeHandler();
  })
}

toggleThemeButtonInit("toggleThemeButton");
