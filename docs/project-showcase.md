# Curated project showcase

The owner's October 2026 revision supersedes the original project-selection brief. The fixed order is Neural-Network, Blackwood-Hargrove-Editor, PF_Project, FLEX-WATCHER. The UI always renders four authored cards; GitHub supplies optional metadata. Both incoming API data and legacy caches are projected through the same ordered allowlist. Missing metadata never removes a card. Failed refreshes preserve the last good cache.

## Source review

- [Neural Network](https://github.com/i250685-aliirtiza/Neural-Network): complete README, autodiff.h, nn.h, arenaAllocator.h and XOR.cpp. Descriptions reflect scalar computation graphs, reverse topological backpropagation, neuron/layer/MLP composition and separate persistent/temporary arenas.
- [Arcanum Editor](https://github.com/i250685-aliirtiza/Blackwood-Hargrove-Editor): complete README and the native editor implementation/header under THE ARACANUM EDITOR. Descriptions reflect Win32 events, independent editor instances, a shifting flat wide-character buffer, layout/cursor mapping and page-scoped search.
- [Tumblepop](https://github.com/i250685-aliirtiza/PF_Project): inspected i250685_D_i250782_D/tumblepop.cpp, asset listings and representative sprite sheets. Descriptions reflect implemented tile collision/gravity, animation, directional capture, character selection and two level layouts. The game was not executed or runtime-tested. Website diagrams are schematic, not gameplay screenshots or claims of original sprite artwork.
- [FLEX Watcher](https://github.com/i250685-aliirtiza/FLEX-WATCHER): complete README and authentication/deployment documentation, with current Oracle behavior taking precedence over older Windows deployment notes. Descriptions cover authorized sessions, validated responses, persistent snapshots, change detection and email notifications.

Only the portfolio repository is changed. Existing academic data, source projects and watcher services are outside this revision.

## Verification

Unit tests cover allowlisting, ordering, legacy-cache filtering, duplicates, missing metadata, pagination and failed refresh preservation. Browser checks assert four visible cards and engineering notes, exact source URLs, no hidden collection, responsive layouts and accessibility at 375, 768 and 1440 pixels. All four source repository links returned HTTP 200. Build/type-check and formatting passed; 58 unit tests passed with the private external transcript capture, which is not committed.
