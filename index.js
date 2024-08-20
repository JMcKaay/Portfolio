//debounce
function debounce(func, wait = 20, immediate = true) {
  let timeout;
  return function() {
    const context = this, args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

//Nav Bar
/* vertical navigation dots */
const VND = ((document, window) => {
  'use strict';

  const render = {
    navDots(sections) {
      const listOfdots = sections.map((element, index) =>
          `<li id="nav-toSection#${index}" class="nav__dot" data-section="${element.id}"></li>`).join('\r\n');

      document.body.innerHTML += `<nav id="nav-dots"><ul>${listOfdots}</ul></nav>`;
    },
  };

  const normalized = {
    positionTop(positionTop) {
      return positionTop - getSize.headerHeight();
    },
  };

  const is = {
    scrollThrowSection(positionScroll, threshold) {
      const {rangeY: {value}} = position;

      return positionScroll >= value.start - threshold &&
             positionScroll < value.end + threshold;
    },

    visibleElement(element) {
      const styleDisplay = getComputedStyle(element, null)['display'];
      const styleVisibility = getComputedStyle(element, null)['visibility'];

      return styleDisplay !== 'none' && styleVisibility !== 'hidden';
    },
  };

  const getSize = {
    headerHeight() {
      const header = document.querySelector('header');

      if (header) {
        const position = getComputedStyle(header, null)['position'];
        return position === 'fixed' ? header.clientHeight || header.offsetHeight : 0;
      }
      return 0;
    },

    fullHeight(element) {
      const marginBottom = parseInt(getComputedStyle(element, null)['margin-bottom']);

      return element.offsetHeight + marginBottom;
    },
  };

  const scroll = {
    top(value) {
      scrollBy({
        top: value,
        left: 0,
        behavior: 'smooth',
      });
    },

    stop(callBack) {
      let currentPageY = null;
      let scrollingTimeout = null;

      const isScrolling = () => {
        if (currentPageY !== pageYOffset) {
          currentPageY = pageYOffset;

          clearTimeout(scrollingTimeout);
          setTimeout(isScrolling, 66);
          scrollingTimeout = setTimeout(callBack, 66);
        }
      };
      isScrolling();
    },
  };

  const keyboard = {
    getKeyCode(event) {
      return event.which || event.keyCode;
    },

    '33' (event, sections) {
      const prevPositionTop = position.getClientPrevTop(sections);

      event.preventDefault();
      scroll.top(prevPositionTop);
    },

    '34' (event, sections) {
      const nextPositionTop = position.getClientNextTop(sections);

      event.preventDefault();
      scroll.top(nextPositionTop);
    },
  };

  const dom = {
    getAllElements(cls) {
      const listOfElements = document.querySelectorAll(`.${cls}`);
      return Array.from(listOfElements);
    },

    containClass(element, cls) {
      return element.classList.contains(cls);
    },

    addClass(element, cls) {
      if (!this.containClass(element, cls)) {
        element.classList.add(cls);
      }
    },

    removeClass(elements, cls) {
      const element = elements.find(element => this.containClass(element, cls));

      if (element) {
        element.classList.remove(cls);
      }
    },

    toggleCls(removeFrom, addTo, cls) {
      this.removeClass(removeFrom, cls);
      this.addClass(addTo, cls);
    },

    toggleDots(indexOfSection) {
      const navDots = this.getAllElements('nav__dot');
      const nextDot = document.getElementById(`nav-toSection#${indexOfSection}`);
      this.toggleCls(navDots, nextDot, 'nav__dot--active');
    },
  };

  const position = {
    rangeY: {
      range: {
        start: null,
        end: null,
      },

      set value(element) {
        this.range = {
          start: element.offsetTop - 30,
          end: element.offsetTop + getSize.fullHeight(element) - 30,
        };
      },

      get value() {
        return this.range;
      },
    },

    scrollThrow(section) {
      const positionScroll = Math.ceil(pageYOffset + getSize.headerHeight());
      const threshold = Math.min(50, window.innerHeight * 0.1);

      if (!is.scrollThrowSection(positionScroll, threshold)) {
        this.rangeY.value = section;
      }

      return is.scrollThrowSection(positionScroll, threshold);
    },

    getClientTop(element) {
      return element.getBoundingClientRect().top || element.getBoundingClientRect().y;
    },

    getClientPrevTop(sections) {
      const prevSection = sections.reduce((cur, acc) => {
        const curPositionTop = this.getClientTop(cur);
        const accPositionTop = this.getClientTop(acc);

        return curPositionTop < 0 && accPositionTop < 0
            ? curPositionTop > accPositionTop ? cur : acc
            : cur;
      });
      const prevPositionTop = this.getClientTop(prevSection);

      return normalized.positionTop(prevPositionTop);
    },

    getClientNextTop(sections) {
      const nexSection = sections.reduce((cur, acc) => {
        const curPositionTop = this.getClientTop(cur);
        const accPositionTop = this.getClientTop(acc);

        return curPositionTop > getSize.headerHeight() + 10
            ? curPositionTop < accPositionTop ? cur : acc
            : acc;
      });

      const nextPositionTop = this.getClientTop(nexSection);

      return normalized.positionTop(nextPositionTop);
    },
  };

  const handleListener = {
    listener({element, event, callBack, arg}) {
      element.addEventListener(event, (evn) => callBack({evn, arg}));
    },

    navDots({evn: {target}, arg: cls}) {
      if (target.tagName === 'LI') {
        const indexOfSection = target.id.split('#')[1];
        const sections = dom.getAllElements(cls);
        const positionTop = position.getClientTop(sections[indexOfSection]);
        const normalizedPosition = normalized.positionTop(positionTop);
        const toggleDots = () => dom.toggleDots(indexOfSection);

        scroll.top(normalizedPosition);
        scroll.stop(toggleDots);
      }
    },

    pgUpDownKeys({arg: cls}) {
      const keyCode = keyboard.getKeyCode(event);
      const sections = dom.getAllElements(cls);

      if (keyboard[keyCode] && !!sections.length) {
        keyboard[keyCode](event, sections);
      }
    },

    scrolling: {
      currentSection: null,
      indexOfSection: null,

      init({arg: sections}) {
        const currentScrollPosition = window.pageYOffset;
        let closestSection = sections[0];
        let closestDistance = Infinity;
        let closestIndex = 0;

        sections.forEach((section, index) => {
          const distance = Math.abs(section.offsetTop - currentScrollPosition);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestSection = section;
            closestIndex = index;
          }
        });

        if (this.currentSection !== closestSection) {
          this.currentSection = closestSection;
          this.indexOfSection = closestIndex;
          dom.toggleDots(this.indexOfSection);
        }
      },
    },

    resize: {
      hideOnSmallScreen(screenSize) {
        const navDots = document.getElementById('nav-dots');
    
        window.screen.width <= screenSize
            ? is.visibleElement(navDots) && (navDots.style.display = 'none')
            : !is.visibleElement(navDots) && (navDots.style.display = 'flex');
      },
    
      init: debounce(function({arg: screenSize}) {
        this.hideOnSmallScreen(screenSize);
      }, 66),
    },
  };

  const init = function({cls, hideOnScreenLess = 0} = {}) {
    const {
      listener,
      pgUpDownKeys,
      scrolling,
      resize,
      navDots: dotsListener,
    } = handleListener;

    render.navDots(dom.getAllElements(cls));
    resize.init({arg: hideOnScreenLess});

    const sections = dom.getAllElements(cls);
    const navDots = document.getElementById('nav-dots');
    const firstDot = document.getElementById('nav-toSection#0');

    dom.addClass(firstDot, 'nav__dot--active');

    listener({
      element: document,
      event: 'keydown',
      callBack: pgUpDownKeys,
      arg: cls,
    });
    listener({
      element: document,
      event: 'scroll',
      callBack: scrolling.init.bind(handleListener.scrolling),
      arg: sections,
    });
    listener({
      element: window,
      event: 'resize',
      callBack: resize.init.bind(handleListener.resize),
      arg: hideOnScreenLess,
    });
    listener({
      element: navDots,
      event: 'click',
      callBack: dotsListener,
      arg: cls,
    });
  };

  return {
    init: init,
  };
})(document, window);

VND.init({
  cls: 'js-navDots',
  hideOnScreenLess: 640,
})

//NavBar Indicator 
window.addEventListener('scroll', debounce(function() {
  const sections = document.querySelectorAll('.section');
  const navText = document.getElementById('page-title');
  const navDots = document.querySelectorAll('.nav__dot');
  const currentScrollPosition = window.pageYOffset;
  let closestSection = sections[0];
  let closestDistance = Infinity;

  sections.forEach((section) => {
    const distance = Math.abs(section.offsetTop - currentScrollPosition);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestSection = section;
    }
  });

  const currentSection = closestSection.getAttribute('id').charAt(0).toUpperCase() + closestSection.getAttribute('id').slice(1);
  navText.textContent = currentSection;

  // Update active dot
  navDots.forEach(dot => {
    if (dot.getAttribute('data-section') === closestSection.id) {
      dot.classList.add('nav__dot--active');
    } else {
      dot.classList.remove('nav__dot--active');
    }
  });
}));

// Optionally, add click events to the nav dots for smooth scrolling:
document.getElementById('nav-dots').addEventListener('click', function(e) {
  if (e.target.classList.contains('nav__dot')) {
    const targetId = e.target.getAttribute('data-section');
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
});

//Main "Hi I am James"
async function init () {
  const node = document.querySelector("#type-text")
  
  await sleep(1000)
  node.innerText = ""
  await node.type('Hello,\u00A0')
  
  while (true) {
    await node.type('Welcome')
    await sleep(2000)
    await node.delete('Welcome')
    await node.type('I\u00A0am\u00A0James')
    await sleep(2000)
    await node.delete('I\u00A0am\u00A0James')
  }
}

// Source code 🚩
const sleep = time => new Promise(resolve => setTimeout(resolve, time))

class TypeAsync extends HTMLSpanElement {
  get typeInterval () {
    const randomMs = 100 * Math.random()
    return randomMs < 50 ? 10 : randomMs
  }
  
  async type (text) {
    for (let character of text) {
      this.innerText += character
      await sleep(this.typeInterval)
    }
  }
  
  async delete (text) {
    for (let character of text) {
      this.innerText = this.innerText.slice(0, this.innerText.length -1)
      await sleep(this.typeInterval)
    }
  }
}

customElements.define('type-async', TypeAsync, { extends: 'span' })

init()

//Layout Animation (About)
const observer = new IntersectionObserver ((entries) => {
  entries.forEach((entry) => {
    console.log(entry)
    if (entry.isIntersecting){
      entry.target.classList.add('show');
    } else {
      entry.target.classList.remove('show');
    }
  });
});

const hiddenElements = document.querySelectorAll('.hidden');
hiddenElements.forEach((el) => observer.observe(el));

const observer2 = new IntersectionObserver ((entries) => {
  entries.forEach((entry) => {
    console.log(entry)
    if (entry.isIntersecting){
      entry.target.classList.add('show2');
    } else {
      entry.target.classList.remove('show2');
    }
  });
});

const hiddenElements2 = document.querySelectorAll('.hidden2');
hiddenElements2.forEach((el) => observer2.observe(el));

//Projects
const panels = document.querySelectorAll('.panel')

panels.forEach(panel => {
    panel.addEventListener('mouseover', () => {
        removeActiveClasses()
        panel.classList.add('active')
    })
})

function removeActiveClasses() {
    panels.forEach(panel => {
        panel.classList.remove('active')
    })
}

