import Mousetrap from 'mousetrap';
import { useEffect } from 'react';

export const useNavBarShortKey = (keys, callback) => {
  useEffect(() => {
    const keyCombo = keys.map((k) => k).join('+');
    Mousetrap.bind(keyCombo, callback);
    return () => {
      Mousetrap.bind(keyCombo, () => {});
    };
  }, []);
};
