import {readFileSync} from 'fs';
import {join} from 'path';

export function getFixture(path, parse) {
    var fixture = readFileSync(join('test/fixtures', path), 'utf8');
    if (parse) {
        return JSON.parse(fixture);
    }

    return fixture;
}
