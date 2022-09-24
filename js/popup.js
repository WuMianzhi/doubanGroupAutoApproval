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

      // 筛选暗号正确的
      if (
        ans == magic &&
        !doubanerName.match(matchREG) &&
        !doubanerProfile.match(normalprofileReg)
      ) {
        const chexkbox = request.querySelector("input");
        chexkbox.checked = true;
        // console.log(doubanerProfile);
      }
    }

    confirmBtn[1].click();
    window.scrollTo({ top: 99999, behavior: "smooth" });
  });
}
