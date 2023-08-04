export function GestureController(options: any) {
  let t = 5;
  let e = document.body;
  let holdTime = 600;
  let w: any = null;

  if (options) {
    if (options.nodeName) {
      e = options;
    } else {
      if (options.element) {
        e = options.element;
      }
      if (options.threshold) {
        t = options.threshold;
      }
      if (options.holdTime) {
        holdTime = options.holdTime;
      }
    }
  }

  let g: any = {
    element: e,
    handlers: [],
  };

  g.on = function (eventType: any, handler: any) {
    switch (eventType) {
      case "tap":
      case "hold":
      case "left":
      case "right":
      case "up":
      case "down":
      case "move":
        g.handlers.push({
          type: eventType,
          handler: handler,
        });
        break;
      default:
        console.warn(
          "invalid eventType specified ignoring handler:",
          eventType
        );
        return;
    }
  };

  g.emit = function (eventType: any) {
    g.handlers.forEach((h: any) => {
      if (h.type == eventType) {
        h.handler.call(null, s);
      }
    });
  };

  function Swipe(touchEvent: any) {
    let i = Date.now();
    let r = g.element.getBoundingClientRect();
    let x = parseInt(touchEvent.touches[0].clientX);
    let y = parseInt(touchEvent.touches[0].clientY);

    w = setTimeout(() => {
      g.emit("hold");
    }, holdTime);

    let edge = (() => {
      if (y - t <= r.top && x - t <= r.left) return "top-left";
      if (y - t <= r.top && x + t >= r.right) return "top-right";
      if (y + t >= r.bottom && x - t <= r.left) return "bottom-left";
      if (y + t >= r.bottom && x + t >= r.right) return "bottom-right";
      if (y - t <= r.top) return "top";
      if (y + t >= r.bottom) return "bottom";
      if (x - t <= r.left) return "left";
      if (x + t >= r.right) return "right";
      return null;
    })();

    return {
      i: i,
      start: {
        x: x,
        y: y,
      },
      end: {
        x: null,
        y: null,
      },
      edge: edge,
      angle: null,
      direction: null,
      delta: {
        x: null,
        y: null,
      },
    };
  }

  let s: any;

  function touchStartHandler(event: any) {
    s = new (Swipe as any)(event);
  }

  function touchMoveHandler(event: any) {
    clearTimeout(w);
    s.end = {
      x: parseInt(event.touches[0].clientX),
      y: parseInt(event.touches[0].clientY),
    };
  }

  function touchEndHandler(event: any) {
    let i = Date.now();
    s.duration = i - s.i;
    delete s.i;

    if (s.duration < holdTime) {
      clearTimeout(w);
      w = null;
    }

    if (s.end.x === null || s.end.y === null) {
      if (!w) {
        g.emit("tap");
      }
      return;
    }

    s.delta.x = Number(s.end.x - s.start.x);
    s.delta.y = Number(s.end.y - s.start.y);
    s.distance = Number(Math.hypot(s.delta.x, s.delta.y));
    s.velocity = s.distance / s.duration;

    if (s.delta.x == 0) {
      if (s.delta.y < 0) {
        s.angle = 0;
      } else if (s.delta.y > 0) {
        s.angle = 180;
      }
    } else if (s.delta.y == 0) {
      if (s.delta.x < 0) {
        s.angle = 270;
      } else if (s.delta.x > 0) {
        s.angle = 90;
      }
    } else {
      let dx = s.delta.x;
      if (dx < 0) {
        dx = dx * -1;
      }

      let dy = s.delta.y;
      if (dy < 0) {
        dy = dy * -1;
      }

      if (dx - t <= 0 && dy - t <= 0 && !w) {
        g.emit("tap");
        return;
      }

      let radians: any = Math.atan(dy / dx);
      let degrees: any = Number(radians * (180 / Math.PI));

      if (s.delta.x < 0 && s.delta.y < 0) {
        s.angle = 360 - (90 - degrees);
      } else if (s.delta.x < 0 && s.delta.y > 0) {
        s.angle = 360 - degrees - 90;
      } else if (s.delta.x > 0 && s.delta.y > 0) {
        s.angle = degrees + 90;
      } else {
        s.angle = 90 - degrees;
      }

      if (s.angle <= 45 || s.angle >= 315) {
        s.direction = "up";
      } else if (s.angle > 45 && s.angle <= 135) {
        s.direction = "right";
      } else if (s.angle > 135 && s.angle <= 225) {
        s.direction = "down";
      } else if (s.angle > 225 && s.angle < 315) {
        s.direction = "left";
      }

      g.emit(s.direction);
    }

    g.emit("move");
  }

  function suppressClick(event: any) {
    if (event.pointerType == "touch") {
      event.preventDefault();
    }
  }

  function disableContextMenu(event: any): any {
    if (event.pointerType == "touch") {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }

  g.element.addEventListener("click", suppressClick);
  g.element.addEventListener("contextmenu", disableContextMenu);
  g.element.addEventListener("touchstart", touchStartHandler, {
    passive: true,
  });
  g.element.addEventListener("touchmove", touchMoveHandler, { passive: true });
  g.element.addEventListener("touchend", touchEndHandler);

  return g;
}
