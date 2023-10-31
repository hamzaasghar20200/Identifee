import { useEffect, useState } from 'react';

const fileProcessingText = [
  'Converting your file into something the computer can understand...',
  'Please wait while we search for the missing bits...',
  'Translating your file into binary...',
  'Applying artificial intelligence to your file...',
  "Extracting data...don't worry, no files were harmed in the process.",
  'Working hard to process your file...our hamsters are taking turns.',
  "Our ninjas are working on your file, they'll be done soon...",
  "It's not magic, it's just computer science...",
  'Calculating...wait, we need to carry the one...',
  'Transforming your file into a masterpiece...',
  "Don't worry, your file is in good hands...",
  "We're juggling your file with our eyes closed...",
  'Charging the quantum processor to process your file...',
  'Your file is getting the VIP treatment...',
  "Please wait while we read your file's mind...",
  "Processing your file like it's a hot potato...",
  'Our robots are hard at work processing your file...',
  "File processing in progress...please wait, or don't, it's up to you.",
  "You know what they say, Rome wasn't processed in a day...",
  'Processing your file with a smile...',
  'Caching your file for faster loading...eventually.',
  'Hang tight, we need to find the right wrench to turn the file compression knob.',
  'The wheels are turning, but the hamsters need a bit more caffeine to pick up the pace.',
  'Please be patient, our file processing elves are working as fast as they can.',
  'Your file is taking a leisurely stroll through our processing pipeline.',
  'Your file is currently taking a nap. We just need to wake it up and get it moving again.',
];

const loadingTexts = [
  'Filling up the loading bar...one pixel at a time.',
  'Hold on, just summoning a few electrons.',
  'Our hamsters are working hard to power up the servers.',
  "Loading...don't worry, it's not a crash, we're just taking the scenic route.",
  "Just waiting for the Internet to arrive. Shouldn't be too much longer...",
  'Counting to infinity...twice. Hang in there!',
  'The little spinning circle is doing its best to keep you entertained.',
  "Loading...this is where we'd put a witty remark if we had one.",
  'Almost there! Just need to convince the data to travel a bit faster.',
  'Patience is a virtue...and a necessity for loading screens.',
  'Loading...we apologize for the delay, our hamster just took a coffee break.',
  'Please wait, while we send our carrier pigeons to fetch your data.',
  'Loading...the progress bar is moving slower than a turtle stampede.',
  "Sit tight, we're creating the perfect cup of virtual coffee to power our servers.",
  'This loading screen is brought to you by our sponsor, the slowest internet connection in the universe.',
  'Just a few more moments...or, as our servers like to call it, an eternity.',
  'Our programmers are currently on a coffee run, please hold.',
  "Loading...we're not sure what's happening either, but we're pretending we do.",
  "Loading...we're currently juggling some bits and bytes. Please stand by.",
];
function getLoadingText(isFileProcessing) {
  const texts = isFileProcessing ? fileProcessingText : loadingTexts;
  const randomIndex = Math.floor(Math.random() * texts.length);
  return texts[randomIndex];
}
const FunnyLoaderText = ({ autoPlay, startingText, isFileProcessing }) => {
  const [text, setText] = useState(
    startingText || getLoadingText(isFileProcessing)
  );
  let timer = null;
  useEffect(() => {
    if (autoPlay) {
      timer = setInterval(() => {
        setText(getLoadingText(isFileProcessing));
      }, autoPlay);
    }
    return () => {
      clearInterval(timer);
    };
  }, []);
  return <span>{text}</span>;
};

export default FunnyLoaderText;
