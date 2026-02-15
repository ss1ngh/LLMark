console.log('LLMark: Background service worker started.');

//set up the alarm when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('LLMark: Extension installed/updated.');
  
  //create an alarm that fires every 60 minutes
  chrome.alarms.create('cleanup-alarm', {
    periodInMinutes: 60 
  });
});

//listen for the alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cleanup-alarm') {
    performCleanup();
  }
});

//cleanup logic
const performCleanup = () => {
  console.log('LLMark: Running cleanup task...');
  
  chrome.storage.local.get(['llmarks'], (result) => {
    const marks = (result.llmarks as any[] )|| [];
    const now = Date.now();
    const fourteenDaysInMs = 14 * 24 * 60 * 60 * 1000;

    //filter out old bookmarks
    const freshMarks = marks.filter((mark: any) => {
      const isOld = (now - mark.createdAt) > fourteenDaysInMs;
      if (isOld) {
        console.log(`Deleting expired mark: ${mark.label}`);
      }
      return !isOld;
    });

    //only update storage if we actually deleted something
    if (freshMarks.length !== marks.length) {
      chrome.storage.local.set({ llmarks: freshMarks }, () => {
        console.log(`Cleanup complete. Removed ${marks.length - freshMarks.length} old bookmarks.`);
      });
    } else {
      console.log('No expired bookmarks found.');
    }
  });
};