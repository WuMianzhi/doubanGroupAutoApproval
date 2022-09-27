let changeColor = document.getElementById("changeColor");
const inAnsIpt = document.getElementById("autoMagic");

// 获取之前的 key
chrome.storage.sync.get("lastAns", ({ lastAns }) => {
  if (lastAns) {
    inAnsIpt.value = lastAns;
  }
});

// When the button is clicked, inject setPageBackgroundColor into current page
changeColor.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.storage.sync.set({ lastAns: inAnsIpt.value }, function (res) {
    console.log("入组暗号为：" + res);
  });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: setPageBackgroundColor,
  });
});

async function setPageBackgroundColor() {
  let magic = "";
  const confirmBtn = document.getElementsByName("accept_btn");

  const matchRate = function (strA, strB) {
    const aLen = strA.length,
      bLen = strB.length;
    // console.log(aLen, bLen, subMatchRate(strA, strB));

    let rate = (100 * subMatchRate(strA, strB)) / bLen;
    return rate;
    /**
     *
     *
     * @param {string} str
     * @param {string} subStr
     * @return {*}
     */
    function subMatchRate(str, subStr) {
      // let maxMatchLen = 0;
      const strList = str.split("");
      const subStrList = subStr.split("");

      let matchChars = "";

      for (let i = 0; i < subStr.length; i++) {
        let matchedIndex = strList.indexOf(subStr[i]);
        if (matchedIndex > -1) {
          strList[i] = "*";
          matchChars += subStr[i];
        }
        // maxMatchLen > matchLen ? null : (maxMatchLen = matchLen);
      }
      // console.log(str);
      // console.log(subStr);
      // console.log(matchChars);
      return matchChars.length;
    }
  };

  await chrome.storage.sync.get("lastAns", (res) => {
    magic = res.lastAns
      .replace(
        /[`:_.~!@#$%^&*() \+ =<>?"{}|, \/ ;' \\ [ \] ·~！@#￥%……&*（）—— \+ ={}|《》？：“”【】、；‘’，。、\n]/g,
        ""
      )
      .toUpperCase();

    const groupRequest = document.querySelectorAll(".group-request-list > li");

    for (let i = 0; i < groupRequest.length; i++) {
      const request = groupRequest[i];
      // 字符处理
      const ans = request
        .querySelector(".inq")
        .textContent.replace(
          /[`:_.~!@#$%^&*() \+ =<>?"{}|, \/ ;' \\ [ \] ·~！@#￥%……&*（）—— \+ ={}|《》？：“”【】、；‘’，。、\n]/g,
          ""
        )
        .toUpperCase();

      // 过滤默认头像的
      const doubanerProfile = request.querySelector("img").src;
      const normalprofileReg = /^https:\/\/img[0-9].doubanio.com\/icon\/user/;

      // 过滤可疑昵称的
      const doubanerName = request.querySelector(".fleft a").textContent;
      const matchREG = /^豆友 [A-Za-z0-9]*$/;
      // console.log(matchRate(ans, magic));
      // console.log(ans, magic, );
      // 筛选暗号正确的
      if (
        matchRate(ans, magic) > 85 &&
        !doubanerName.match(matchREG) &&
        !doubanerProfile.match(normalprofileReg)
      ) {
        request.style.backgroundColor = "#edf4ed";
        const chexkbox = request.querySelector("input");
        chexkbox.checked = true;
        // console.log(doubanerProfile);
      }
    }

    confirmBtn[1].click();
    window.scrollTo({ top: 99999, behavior: "smooth" });
  });
}
