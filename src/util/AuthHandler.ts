const EVENT_ORIGIN = document.location.origin;

export default class AuthHandler {
  windowObjectReference: Window | null = null;
  listener?: (this: Window, event: MessageEvent<any>) => any;
  timer?: number;


  auth(name = "_blank"): Promise<string> {
    console.log(process.env.VUE_APP_API_BASE);
    return new Promise((resolve, reject) => {
      // WEBSITE ENV
      const _handleCode = (event: MessageEvent) => {
        if (event.type !== "message") {
          return;
        }

        if (event.origin !== EVENT_ORIGIN) {
          // reject("Wrong origin");
          // return;
        }

        const { data } = event;

        if (!data) {
          reject("No data received");
          return;
        }

        if (data.source === "callback") {
          resolve(data.token);
        }
      };
      if (this.listener)
        window.removeEventListener("message", this.listener);

      const strWindowFeatures =
        "toolbar=no, menubar=no, width=500, height=800, top=100, left=100";

      if (!this.windowObjectReference || this.windowObjectReference.closed) {
        this.windowObjectReference = window.open(
          `/api/auth/discord`,
          name,
          strWindowFeatures
        );
      } else {
        this.windowObjectReference.focus();
      }

      if (this.timer) {
        clearInterval(this.timer);
      }

      this.timer = window.setInterval(() => {
        if (this.windowObjectReference?.closed) {
          reject("Window closed");
          clearInterval(this.timer);
        }
      }, 2000);

      this.listener = _handleCode;

      window.addEventListener("message", this.listener, false);
    });
  }
}
