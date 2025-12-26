# Sudoku Owl - Project Planning Document

## Project Overview

**Name:** Sudoku Owl
**Tagline:** "Wise eyes on every puzzle"
**Platform:** iOS (React Native / Expo)

---

## 1. What Are We Trying To Do?

Build a simple, polished Sudoku app with a unique teaching/hint system that helps players learn solving techniques rather than just giving answers.

**Key Differentiator:** When stuck, the app teaches you WHY a number goes somewhere using real solving methods (candidates, naked pairs, etc.) - not just "the answer is 7".

---

## 2. Goals

### Primary Goals
1. **Establish App Store presence** - Get developer account approved with a live, quality app
2. **Generate ad revenue** - Cover Apple Developer fee ($99/year) + modest profit
3. **Learn deployment pipeline** - Practice full app lifecycle before launching Gift Owl

### Success Metrics
- [ ] App approved and live on App Store
- [ ] Generating any ad revenue within 30 days
- [ ] 100+ downloads in first month
- [ ] 4+ star rating maintained

---

## 3. Revenue Model

| Source | Type | Notes |
|--------|------|-------|
| Interstitial Ads | Primary | Between puzzles (every 2-3 games) |
| Banner Ads | Secondary | Bottom of screen during play |
| Premium Upgrade | Optional | $2.99 one-time for ad-free + extra features |

**Break-even calculation:**
- Apple Developer fee: $99/year
- At ~$1 eCPM, need ~100,000 ad impressions/year
- Or ~275 impressions/day
- Or ~50-100 daily active users

---

## 4. MVP Feature Set

### Must Have (v1.0)
- [ ] Sudoku grid with touch input
- [ ] Puzzle generator (Easy, Medium, Hard)
- [ ] Number input (tap cell, tap number)
- [ ] Pencil marks / candidates mode
- [ ] Basic validation (highlight errors)
- [ ] Timer
- [ ] New game / restart
- [ ] Ad integration (AdMob)

### Teaching Features (v1.0)
- [ ] "Hint" button that explains the technique, not just the answer
- [ ] Highlight relevant cells when teaching
- [ ] 2-3 basic techniques: Singles, Candidates, Naked Pairs

### Nice to Have (v1.1+)
- [ ] Statistics tracking
- [ ] Daily challenge
- [ ] More advanced techniques
- [ ] Themes / dark mode
- [ ] Premium upgrade (ad-free)
- [ ] Haptic feedback

---

## 5. Technical Stack

- **Framework:** React Native + Expo
- **State:** Zustand or Context
- **Ads:** Google AdMob (react-native-google-mobile-ads)
- **Analytics:** Expo Analytics or Firebase
- **Puzzle Generation:** Custom algorithm or sudoku library

---

## 6. Milestones

### Phase 1: Foundation (Week 1)
- [ ] Project setup (Expo, TypeScript)
- [ ] Basic sudoku grid component
- [ ] Puzzle generation logic
- [ ] Number input system

### Phase 2: Core Gameplay (Week 2)
- [ ] Pencil marks / candidates
- [ ] Error highlighting
- [ ] Timer
- [ ] Win detection
- [ ] Difficulty levels

### Phase 3: Teaching System (Week 3)
- [ ] Hint engine (find next logical move)
- [ ] Technique explanations
- [ ] Visual highlighting for hints

### Phase 4: Polish & Monetization (Week 4)
- [ ] AdMob integration
- [ ] App icon (Owl image)
- [ ] Splash screen
- [ ] App Store assets (screenshots, description)
- [ ] Testing & bug fixes

### Phase 5: Launch
- [ ] TestFlight beta
- [ ] App Store submission
- [ ] Monitor & iterate

---

## 7. Procedures

### Development Workflow
1. Feature branch from `main`
2. Local testing on simulator + device
3. PR review (self or automated)
4. Merge to `main`
5. Tag release version

### Release Process
1. Bump version in app.json
2. Build with `eas build`
3. Submit to TestFlight
4. Test on real device
5. Submit for App Store review
6. Monitor crash reports / reviews

### Hotfix Process
1. Branch from latest release tag
2. Fix issue
3. Expedited build + submit
4. Request expedited review if critical

---

## 8. Open Questions

<!-- TO BE FILLED IN AFTER DISCUSSION -->

---

## 9. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| App Store rejection | Follow guidelines strictly, simple scope |
| Low downloads | ASO optimization, unique teaching angle |
| Ad revenue too low | Keep costs minimal, premium option |
| Puzzle generation bugs | Use proven algorithm, thorough testing |

---

## 10. Timeline

**Target:** MVP live on App Store within 4-6 weeks

---

*Document created: December 2024*
