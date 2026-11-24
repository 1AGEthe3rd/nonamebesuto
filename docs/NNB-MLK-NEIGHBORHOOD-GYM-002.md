# NNB — NE MLK Neighborhood Gym (draft, November 23, 2026)

## Intent
Make the existing **No Name Besuto** boxing gym feel like a believable, walk-in neighborhood training facility along Portland's **NE Martin Luther King Jr. Boulevard**, in the Soul District area of HQ1. This is an **original illustrative virtual environment** and is NOT a reproduction of a specific property, real-world tenancy, actual gym, survey, building listing or business partnership.

The existing live NNB gym remains unchanged unless the founder approves this draft.

## Architectural inspiration
- Ground-level commercial/industrial bay, street-facing glazing, steel storefront frames.
- Portland brick masonry, painted foundation, exposed industrial joists and warm practical lighting.
- Rubber training floor, boxing posters, bag chains, bench seating, gym clock and original branded details.
- A conceptual sidewalk, boulevard and anonymous neighboring facades visible through the street windows.
- Green 1AGE/NNB light stays an accent, not the dominant building material.

Sources consulted for characteristic features (reference only; no property claim):
- Prosper Portland, MLK Jr. Boulevard Commercial Development Strategy (commercial/industrial building mix): https://prosperportland.us/wp-content/uploads/2016/07/MLK-Jr-Boulevard-Commercial-Development-Strategy.pdf
- City of Portland's African American Historic Resources documentation (historic storefront/bay patterns): https://www.portland.gov/bps/planning/historic-resources/documents/african-american-resources-portland-oregon-1851-1973/download
- Example historic renovated commercial bay on NE MLK (brick, exposed ceilings, glass entry): https://www.loopnet.com/Listing/1804-NE-Martin-Luther-King-Jr-Blvd-Portland-OR/39464421/

**No photos, logos, or proprietary building models are reproduced in the runtime.** Brick/rubber/sky textures are original procedural textures generated on a canvas.

## Guardrails
The new visual layer lives in `mlk-gym-environment.mjs`. The only change to `index.html` imports and invokes that module **after the existing gym layout has been instantiated**, and only in gym mode. The following original gameplay is untouched:

- Existing ring location and ropes.
- Heavy bag mesh, target coordinates, punch impact and timed-round scoring.
- Locker row and weigh-in conceptual placeholder.
- Original collision/movement controls and mobile joysticks/gamepad.
- HQ1 entry and return `hq1-nnb-gym` identity and paths.
- `?preview=1` studio globe behavior.
- No user accounts, wallet, checkout, camera, real weigh-in capture or persistent game data.

## Review and acceptance
- Render the original scene with the new facade in headless Chrome/WebGL at desktop + phone-shaped resolutions.
- Capture a preview of the actual training scene and a view toward the street windows.
- Check for script exceptions and canvas/WebGL failures.
- Confirm accessibility to the existing bag and HQ1 exit through a browser interaction.
- Test physical iPhone Safari and Logitech F310 when devices are available.
- Share actual renders with the founder and obtain approval before merging.
