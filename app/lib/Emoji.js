import escape from 'escape-html';
import emojiRegex from 'emoji-regex';
import BUILDKITE_EMOJI from '../emojis/buildkite';
import UNICODE_EMOJI from '../emojis/apple';

// Unicode emoji regexp based on https://github.com/mathiasbynens/emoji-regex
const UNICODE_REGEXP = emojiRegex();
const COLON_REGEXP = new RegExp('\:[^\\s:]+\:', 'g');

class Emoji {
  parse(string, options = {}) {
    if (!string || string.length === 0) {
      return '';
    }

    // Turn off escaping if the option is explicitly set
    if (options.escape !== false) {
      string = escape(string);
    }

    // Start with replacing BK emoji (which are more likely than Unicode emoji)
    string = this._replace_colons(BUILDKITE_EMOJI, string);

    // Then do a Unicode emoji parse
    if (options.replaceUnicode !== false) {
      string = this._replace_unicode(UNICODE_EMOJI, string);
    }

    string = this._replace_colons(UNICODE_EMOJI, string);

    return string;
  }

  // replaces unicode emoji with images
  _replace_unicode(catalogue, string) {
    return string.replace(UNICODE_REGEXP, (match) => {
      const emojiIndex = catalogue.index[match];

      if ((typeof emojiIndex) === 'number') {
        return this._image(catalogue, catalogue.emoji[emojiIndex]);
      } else {
        return match;
      }
    });
  }

  // replaces emoji shortcodes with images
  _replace_colons(catalogue, string) {
    // NOTE: replacements are done indirectly here, because the
    // colon regexp will not catch modifiers in a single match
    const matches = string.match(COLON_REGEXP);
    const replacements = [];

    // Bail if there aren't any emojis to replace
    if (!matches || !matches.length) {
      return string;
    }

    for (let matchIndex = 0, matchLength = matches.length; matchIndex < matchLength; matchIndex++) {
      const match = matches[matchIndex];
      const nextMatch = matches[matchIndex + 1];

      // See if this match and the next one, makes a new emoji. For example,
      // :fist::skin-tone-4:
      if (nextMatch) {
        const modifiedEmojiIndex = catalogue.index[`${match}${nextMatch}`];

        if ((typeof modifiedEmojiIndex) === 'number') {
          replacements.push(this._image(catalogue, catalogue.emoji[modifiedEmojiIndex]));
          replacements.push("");
          matchIndex += 1;

          continue;
        }
      }

      const emojiIndex = catalogue.index[match];

      if ((typeof emojiIndex) === 'number') {
        replacements.push(this._image(catalogue, catalogue.emoji[emojiIndex]));
      } else {
        replacements.push(match);
      }
    }

    return string.replace(COLON_REGEXP, () => replacements.shift());
  }

  _image(catalogue, emoji) {
    // Emoji catalogue hosts have a normalized host that always end with a "/"
    const emojiUrl = `${catalogue.host}${emoji.image}`;
    const emojiCanonicalRepresentation = emoji.unicode || `:${emoji.name}:`;

    return `<img class="emoji" title="${emoji.name}" alt="${emojiCanonicalRepresentation}" src="${emojiUrl}" draggable="false" />`;
  }
}

export default new Emoji();
