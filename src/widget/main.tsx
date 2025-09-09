// src/widget/main.tsx
import { render } from "preact";
import App from "./App";
import "./styles.css";

const WIDGET_SCRIPT_ID = "your-app-widget-script";

class LiveChatWidget {
  init(config) {
    this.renderWidget(config);
  }

  renderWidget(config) {
    const hostElement = document.createElement("div");
    hostElement.id = "live-chat-widget-host";
    document.body.appendChild(hostElement);

    const shadowRoot = hostElement.attachShadow({ mode: "open" });

    const styleEl = document.createElement("style");
    // In a real implementation, you'd import the CSS as a string
    styleEl.innerHTML = `/* CSS from styles.css will be injected here */`;
    shadowRoot.appendChild(styleEl);

    const appContainer = document.createElement("div");
    shadowRoot.appendChild(appContainer);

    render(<App {...config} />, appContainer);
  }

  autoInit() {
    setTimeout(() => {
      // If window.LiveChatWidget.init was not called
      if (!document.getElementById("live-chat-widget-host")) {
        const scriptTag = document.getElementById(WIDGET_SCRIPT_ID);
        if (scriptTag) {
          const projectId = scriptTag.getAttribute("data-project-id");
          if (projectId) {
            this.init({ projectId });
          } else {
            console.error("Live Chat Widget: data-project-id not found.");
          }
        }
      }
    }, 500);
  }
}

const instance = new LiveChatWidget();
window.LiveChatWidget = instance;
instance.autoInit();
