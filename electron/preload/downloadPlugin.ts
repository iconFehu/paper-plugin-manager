let xxx = () => {
  setTimeout(() => {
    let el: any = document.querySelector('a[class=inner]');
    console.log('el', el);
    if (el) {
      el?.click?.();
    } else xxx();
  }, 500);
};
xxx();
