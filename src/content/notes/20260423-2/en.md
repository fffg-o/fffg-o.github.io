---
title: "20260423-2"
pubDate: 2026-04-23
description: "gpt"
category: "随笔"
image: ""
draft: false
slugId: "momo/notes/20260423-2"
pinTop: 0
---


### fffg

Let's start by setting up the basic architecture: I want to participate in a Solana hackathon, which requires building a project on Solana. I'm planning to make a roguelike deck-building game similar to Backpack Hero.

* * *

### ChatGPT

Let me turn this into a practical starting plan: first, confirm the current Solana hackathon and development entry points, then give you an on-chain/off-chain architecture, repository structure, and first-phase milestones suited to a Backpack Hero–style roguelike deckbuilder.

Yes—do not rush to put too much logic on-chain. This direction is a very good fit for a Solana hackathon project built around **“running core combat off-chain while using the chain for assets, seasonal results, and verifiable achievements.”** That makes it much easier to deliver something **playable, demoable, and able to clearly explain why it needs Solana** within the available time. Solana still treats hackathons as an online launchpad for projects, and entries are expected to be clearly “built on Solana”; the official development docs also continue to recommend starting from existing templates, Anchor, and game examples.

#### My Recommended Project Positioning

You can define the project in one sentence like this:

**Bag of Fate / Packrun**  
A game that combines **inventory management + roguelike card combat**: during a run, players collect cards, relics, and backpack items, and the way they arrange their backpack affects combat deck composition, cost, triggers, and progression. Outside the run, key achievements are written to Solana, forming assets, seasonal rankings, and a tradable/composable game identity.

The benefits of this positioning are:

1. **The gameplay stands on its own**, so it does not become “putting something on-chain just for the sake of it.”
2. **Solana’s low fees and high throughput** are a better match for lightweight assets, run records, leaderboards, and seasonal progression. Solana also maintains game examples, game SDKs, and dedicated game development entry points.
3. Hackathon judges usually care about three things: whether the chain is actually used, whether the project has user value, and whether it could grow into a product. Your theme naturally makes all three easy to explain.

#### Do Not Start with “Fully On-Chain Combat”

The safest architecture for version one is:

#### Off-chain

* Combat loop
* Drawing cards / playing cards / enemy AI
* Backpack grid layout
* Most numerical calculations
* Animation, levels, sound effects, draft saves

#### On-chain

* Player profile
* Season / run summary results
* Achievements, titles, run proofs
* Rare relic or cosmetic assets
* Leaderboard submissions
* Optional: run seed / run hash / result commitment

The reason is practical: Solana programs are well suited for **state confirmation, asset ownership, and composability**, but not for writing every step of a roguelike’s in-run state to the chain. Solana’s official development materials also emphasize watching compute usage and provide game-oriented templates and SDKs.

#### A System Design Best Suited to a Hackathon

#### 1. Minimum Viable Gameplay

Compress the design into these modules first:

* **Backpack system**: a 6x4 or 5x5 grid
* **Item types**:
    * Weapons: determine your base attack cards
    * Armor: improves block / shields
    * Trigger items: adjacency bonuses, chains, start-of-battle effects
    * Consumables: one-time spells or healing
* **Card system**:
    * Attack
    * Defense
    * Movement / backpack rearrangement
    * Triggering backpack slot effects
* **Roguelike loop**:
    * 3–5 battles
    * A 3-choice reward after each battle
    * A boss stage
* **Meta-progression**:
    * Clear records
    * Highest floor reached
    * Rare relic unlocks

That is already enough for a solid demo.

* * *

#### 2. Why It Should Definitely Use Solana

You need to make the “why on-chain” argument very concrete.

#### The Strongest Core Narrative

**After each successful clear, generate a verifiable run record**:

* run_id
* seed
* floor_reached
* boss_killed
* relics_used_hash
* deck_hash
* score
* timestamp

Writing this information to Solana gives you:

* Public player records
* A leaderboard
* Achievement proofs
* A data foundation for future competitive modes

#### The Second Core Narrative

**Turn relics / titles / skins into assets**

* Rare relic skins
* Special card backs
* Season-limited titles
* Clear-commemorative NFTs / compressed assets

That gives you a clean answer to the question, “Why isn’t this just a normal web game?”

#### The Third Core Narrative

**Composable identity**  
The player’s wallet address is their identity, which can later expand into:

* Guilds
* Seasonal tickets
* PvP tournament registration
* Cross-game identity display

Solana’s game ecosystem pages also emphasize this kind of game-oriented development capability and ecosystem tooling.

#### Recommended Tech Stack

#### Frontend / Game Layer

For a hackathon, the best choice is one of these two:

#### Option A: Next.js + React + Phaser

Best if you want to quickly build a playable browser demo.

* Rendering: Phaser
* UI: React / Next.js
* Wallet: Solana Wallet Adapter
* Chain interaction: `@solana/web3.js`
* Program client: Anchor client

Solana’s official docs clearly lay out a Next.js/React + Anchor path for games and also mention Phaser templates as a good starting point for browser-based games.

#### Option B: Unity + Solana SDK

Best if you care more about presentation quality, though development may be slower during a hackathon. Solana’s docs list a Unity SDK as one of the community game SDKs.

**For your game, I recommend Option A.**  
Reason: card gameplay + backpack grids + browser demo = faster development.

* * *

#### On-chain

* Write the Solana program with **Anchor**
* The program is responsible for:
    * Player profile PDA
    * Run result PDA / leaderboard PDA
    * Achievement PDA
    * Optional reward mint / claim logic

Anchor is still one of the most common and fastest ways to get into production development on Solana, and both Solana’s official docs and Anchor’s docs place it prominently in their Quickstart / Basics paths.

* * *

#### Data Layer

* Off-chain database: Postgres / Supabase
* Store:
    * Battle replays
    * Detailed player run data
    * Image assets
    * Analytics data
* Keep only summaries and key ownership records on-chain

#### You Can Define Your Repository Structure Like This

```text
packrun/
  apps/
    web/                 # Next.js frontend + wallet integration + game UI
    game/                # Phaser game core (can also be merged into web)
  programs/
    packrun_program/     # Anchor program
  packages/
    sdk/                 # TypeScript SDK for calling the program from the frontend
    game-core/           # Pure TypeScript combat rules, backpack calculations, card resolution
    shared/              # Types, constants, schemas
  backend/
    api/                 # Leaderboard / replay / anti-cheat helpers
  assets/
    cards/
    relics/
    enemies/
  docs/
    pitch.md
    economy.md
    architecture.md
```

#### On-Chain Account Design

Start with at least these 4 PDAs:

#### PlayerProfile

```text
seeds = ["player", player_pubkey]
fields:
- authority
- username / nickname
- total_runs
- best_score
- highest_floor
- unlocked_flags
```

#### RunRecord

```text
seeds = ["run", player_pubkey, run_id]
fields:
- player
- run_id
- seed
- score
- floor_reached
- result
- deck_hash
- relic_hash
- created_at
```

#### LeaderboardSeason

```text
seeds = ["season", season_id]
fields:
- season_id
- start_ts
- end_ts
- ruleset_hash
```

#### Achievement

```text
seeds = ["achievement", player_pubkey, achievement_id]
fields:
- player
- achievement_id
- unlocked_at
```

That is already enough for a demo. Do not start by building a complicated economy system.

#### The Innovation Most Worth Emphasizing in the Game Rules

If you are making it into **“Backpack Hero + card roguelike”**, it is best to highlight one genuinely fresh core mechanic:

#### Core Mechanic Suggestion

**Backpack layout directly rewrites deck behavior**  
For example:

* Put a sword next to a shield: normal attacks gain block
* For every gem around a staff: spell damage +1
* Put a bow on the edge of the backpack: your first ranged card is free
* Cursed items occupy slots, but enable high-risk, high-reward cards

That gives you three layers of strategy:

1. What items you choose
2. How you arrange them
3. How you play cards in combat

That will impress judges much more easily than “ordinary card game + ordinary NFT.”

#### Product Goals for the Hackathon Version

#### A 7-Day MVP

* Wallet connection
* 1 character
* 20–30 cards
* 15–20 items / relics
* 8–10 enemy types
* 1 boss
* Submit run result on-chain after a clear
* On-chain leaderboard page

#### A Stronger 14-Day Version

* Daily challenge seed
* On-chain rare relic unlocks
* Run result sharing page
* Replay hash / seed verification
* Seasonal leaderboard

#### Advanced Version

* PvP ghost runs
* Community-designed cards
* Compressed-asset achievement system
* On-chain tournament registration

#### What You Should Show Most in a Hackathon Demo

Recommended demo order:

1. Open the game and connect a wallet
2. Start a run and show how backpack layout affects cards
3. Play one battle and explain the strategic depth
4. Submit the run result to Solana after clearing or failing
5. Show your address and score on the leaderboard page
6. Show an on-chain achievement or a rare relic unlock

That is enough to explain within 2–3 minutes that **the game is fun + Solana is necessary**.

#### The 3 Things You Should Do First

#### First: Lock Down the Project Scope

Limit version one to:

* Single-player PvE
* On-chain run records + achievements
* No token economy
* No marketplace
* No complex NFT progression

#### Second: Build the Core Loop First

Do not touch Anchor yet. First build:

* The backpack grid system
* Adjacency bonuses between items
* Drawing cards and playing cards
* Enemy turns

#### Third: Add the Minimum On-Chain Features

Only do:

* `init_player`
* `submit_run`
* `unlock_achievement`

That is enough.

#### Here Is a Pitch Blurb You Can Use Directly

You can start with this version:

> We are building a roguelike deck-building game in the Solana ecosystem. During each run, players manage backpack layout, collect items, and build decks to complete battles. Unlike traditional card games, the positional relationship between items in the backpack directly affects the cost, effects, and chain triggers of combat cards. Solana in this project is used for player identity, run records, seasonal leaderboards, and rare achievement assets, making game progress and highlight moments verifiable, ownable, and composable.

#### My Assessment of This Project Idea

**This is a very good hackathon theme.**  
Because it gives you all of the following at once:

* Playability
* Strong visual demo potential
* A clear path to an MVP
* An easy explanation for why Solana is used
* Room to grow into a real product later

The most suitable next step is for me to break this down into a **technical architecture + module checklist + 2-week development schedule**.

* * *

### fffg

As for on-chain interaction, should it be designed so that every small battle interacts with the chain, or the whole game interacts with the chain once after completion, or should every action / every card draw interact with the chain?

* * *

### ChatGPT

Let me turn this into a practical decision: compare three levels of on-chain interaction granularity, then give you the approach that best fits a hackathon and can actually run in practice.

* * *

### ChatGPT

Here is the conclusion first:

**For the hackathon version, the best solution is to interact with the chain when the entire run ends, or at a few “key checkpoints.”**  
**Do not make every action / every card draw go on-chain, and in most cases do not make every small battle go on-chain either.**

The reason is not that it is “impossible,” but that **product experience, cost, failure rate, and development complexity** all get noticeably worse. Solana fees are low, but every transaction still has a base fee; and even when a transaction fails, the fee is usually still charged. The official docs also explicitly emphasize minimizing compute usage and paying attention to compute budget and priority fees.

* * *

#### How to Choose Among the Three Options

#### Option A: Put Every Action / Every Card Draw On-Chain

For example:

* Draw 1 card → send 1 transaction
* Play 1 card → send 1 transaction
* End turn → send another transaction

**I do not recommend this.**

Why:

1. **The game will feel terrible to play**  
   A card roguelike should feel continuous, immediate, and smooth. Requiring a signature or waiting for confirmation every step will directly destroy the gameplay experience. Solana’s official game development guides also emphasize that on-chain interactions are better suited for “small but important” integrations; they even mention using auto-approved transactions to improve smoothness, which indirectly confirms that frequent step-by-step signing is already a UX problem.
2. **Costs get amplified**  
   Each Solana transaction has a base fee. The current docs list **5,000 lamports per signature**, and there may also be added priority fees. High-frequency micro-transactions can turn a cheap chain into something that is “not cheap in total.”
3. **The failure surface becomes much larger**  
   Any single failed transaction can interrupt the run, and the docs clearly state that **fees are still charged even if the transaction fails.**
4. **Program complexity explodes**  
   You would need to turn the full combat state, backpack state, draw pile, discard pile, and enemy state into an on-chain state machine, while constantly managing CU limits and account reads/writes. In a hackathon, that is a very easy way to burn all your time. Solana’s official materials consistently emphasize optimizing compute usage.

**There is only one case where this makes sense:**  
When the point of the game itself is a fully on-chain strategic contest, and the on-chain verifiable process is the project’s main selling point.  
But that is clearly not the selling point of your theme.

* * *

#### Option B: Put Each Small Battle On-Chain After It Ends

For example:

* Finish one battle and submit the battle result
* Then enter the next battle

**This is possible, but not the best default choice.**

Advantages:

* Much lighter than step-by-step on-chain interaction
* Each battle can produce some verifiable result
* Fits things like “daily challenge stages” or “stage-based scoreboards”

Disadvantages:

* It still interrupts the experience
* It adds a lot of intermediate-state design
* A 5-battle run means at least 5 chain interactions
* You still need to handle “player quit halfway / disconnected / didn’t submit / restarted” kinds of issues

**When is it suitable?**  
When “each battle” itself is the unit of competition, for example:

* A daily single-stage challenge
* A Boss Rush leaderboard
* Asynchronous PvP where each round is resolved separately

For your current first version of a Backpack Hero–style roguelike card game, I do not think this is the best starting point.

* * *

#### Option C: Put the Entire Game On-Chain at the End

For example:

* Optionally create a run when the run starts
* Submit a one-shot result summary when the run ends

**This is the default solution I recommend most.**

Advantages:

1. **Best gameplay feel**  
   All in-run operations are resolved instantly off-chain, so the game feels as smooth as a normal indie game.
2. **Easiest to build**  
   You only need the on-chain program to provide:
    * `init_player`
    * `start_run` (optional)
    * `submit_run`
    * `unlock_achievement`
3. **Best for a hackathon**  
   The demo becomes very clear:  
   “Gameplay is smooth → after clearing, the run record goes on-chain → leaderboard / achievements appear.”
4. **Best aligned with Solana’s natural role in games**  
   Solana’s official game docs already position Solana around identity, assets, achievements, payments, and lightweight game interactions—not as something that requires every combat tick to be written on-chain.

* * *

#### I Recommend a “1 + 1/2” Structure

Not purely a single interaction at the very end, but:

#### Necessary On-Chain Interaction 1: When Entering a Run

Optionally make a lightweight `start_run`  
Record:

* player
* run_id
* seed_hash / ruleset_hash
* season_id
* start_ts

Purpose:

* Prevent “play first, then fabricate a better opening state”
* Give daily challenges / leaderboards a clear starting point
* Leave a hook for replay verification

#### Necessary On-Chain Interaction 2: When the Run Ends

Implement `submit_run`  
Record:

* run_id
* final_score
* floor_reached
* win/lose
* deck_hash
* relic_hash
* replay_hash
* end_ts

#### Optional On-Chain Interaction: Key Reward Points

Only put very rare, high-value events on-chain, such as:

* First clear achievement unlock
* Obtaining a rare relic skin
* Claiming a seasonal reward

This structure is more stable than “submit only at the very end,” while still not damaging the gameplay experience.

* * *

#### My Clear Recommendation to You

#### Build It Like This Right Now:

#### In-Run: Keep It Off-Chain

* Every card draw
* Every card play
* Backpack arrangement
* Enemy actions
* Battle resolution
* 3-choice rewards

#### End of Run: Put It On-Chain

* Run result
* Score
* Achievements
* Leaderboard

#### Very Few Checkpoints: Put Them On-Chain

* Run start commitment
* Rare asset issuance
* Seasonal reward claim

* * *

#### Why Not “Every Small Battle Goes On-Chain”?

Because it sits in the most awkward middle ground:

* More disruptive than submitting the whole run once
* Not much less painful than full step-by-step state design
* Yet without the strong narrative value of a fully on-chain verifiable process

So unless your natural competitive unit is literally “one battle,” it is not worth it.

* * *

#### The Best Practical Version for Your Project

For version one, I recommend keeping only these on-chain data structures:

#### PlayerProfile

* authority
* total_runs
* best_score
* highest_floor
* achievement_flags

#### RunCommit

* player
* run_id
* seed_hash
* season_id
* started_at

#### RunResult

* player
* run_id
* score
* floor_reached
* result
* deck_hash
* relic_hash
* replay_hash
* submitted_at

#### Achievement

* player
* achievement_id
* unlocked_at

That is already enough for a hackathon demo.

* * *

#### One-Line Decision Table

#### Which Option Should You Choose Now?

* **Every action / every card draw on-chain**: do not choose this
* **Every small battle on-chain**: usually do not choose this
* **Put the whole run on-chain after it ends**: choose this
* **Add a commit at the start**: even better

* * *

#### Final Recommendation

**Recommended architecture:**  
**Complete the entire run’s combat and numerical resolution off-chain, and use the chain only for run-start commitment + run-end result submission + achievements / leaderboard.**

This is the most balanced choice right now:

* Fast to develop
* Smooth demo
* Clear Solana value
* Easy for judges to understand
* Naturally expandable later into daily challenges, seasonal leaderboards, and on-chain assets

My next step could be to draw out the sequence diagram and account structure for this **“game frontend + Anchor program + submission flow.”**

* * *

### fffg

If we use an all-off-chain run model with only the final result submitted on-chain, then from a security perspective, if someone modifies the drop rate of rare cards in combat rewards, would that be hard to detect?

* * *

### ChatGPT

Let me define the risk boundary clearly first: if the whole game runs off-chain and only the final result goes on-chain, then **once a core judgment like drop rate is handled entirely on the client, it is indeed very hard for the chain itself to detect manipulation**. Next I’ll break down where the difficulty lies, what kinds of cheating are most realistic, and how to patch it enough for a hackathon.

* * *

### ChatGPT

Yes—and not just “a little difficult,” but:

**If the drop rate of rare cards is calculated locally on the client, and you only submit the result on-chain after the run ends, then cheating by tampering with that drop rate is usually invisible to the chain itself.**

That is because a Solana program only sees the final submitted result; the program itself is stateless code, and only the state you explicitly pass in and store participates in validation. In other words, **the chain does not automatically know whether this rare card really dropped at a 1% rate, or whether you changed your local code so it dropped at 100%.**

#### Let’s Start with the Essence of the Problem

What you are discussing is a classic issue:

**“The game process is off-chain, but the result is on-chain.”**  
The biggest security weakness in this architecture is not forged transactions, but **the invisibility of the process that produced the result**.

If all of the following happen on the client:

* Reward generation after battles
* Randomness for drops
* Rarity determination
* Reward pool sampling

Then an attacker only needs to modify the frontend JS, local memory, a proxy, or API responses, and then submit a result that **looks legal**.  
On-chain, you can only validate:

* That the player signed it
* That the submission format is correct
* That the run_id is not duplicated
* That the account relationships are legal

But it is **very hard to verify whether the drop was really calculated under the correct probabilities**. That is why verifiable randomness is treated as its own class of infrastructure in on-chain gaming. Switchboard’s docs state it directly: on-chain randomness is hard, and randomness usually needs to be provided by an external mechanism and then submitted as a single result to the chain; otherwise different nodes generating randomness independently would cause inconsistent state.

#### Why This Kind of Cheating Is Hard to Detect

#### 1. The Result Can Look Completely Reasonable

If someone changes the drop rate of a rare card from 1% to 5%, they do not need to get god-tier cards every run.  
They only need to increase it slightly, and over time the gains are huge—even though any single run does not look outrageous.

That is much harder to catch than something like “submit a score of 99999,” because the latter looks like an obvious outlier while the former looks like lucky variance.

#### 2. In the End You Only Receive a Summary, Not the Process

If the chain stores only:

* Final score
* Final floor reached
* Final list of obtained cards

And you do **not** have:

* The randomness source at each reward checkpoint
* Reward pool snapshots
* The sampling process
* A step-by-step combat log

Then it becomes almost impossible to replay why that rare card dropped in the first place.

#### 3. Even Having a Replay Does Not Automatically Prove There Was No Cheating

If the replay log is also generated by the client, then an attacker can forge the log as well.  
So “I have a replay file” does not automatically mean “I can prove the result is legitimate.”

* * *

#### But This Does Not Mean “Whole Run Off-Chain” Is Inherently Unsafe

The correct way to understand it is:

**The problem is not that the whole run is off-chain; the problem is that you must take the power to generate high-value outcomes away from the client.**

For your project, the key issue is not whether every draw goes on-chain, but this:

#### Do Not Let the Client Decide These Things by Itself

* Rare drops
* Seasonal rewards
* Score-critical leaderboard events
* Rare relic / NFT / achievement issuance

At minimum, those need to be handled in one of the following three ways.

* * *

#### Three Practical Defensive Approaches

#### Option 1: Put Reward Randomness on a Server, and Only Let the Chain Accept Server-Signed Results

This is the **most practical hackathon solution**.

Flow:

1. The client finishes a battle and requests reward settlement from your backend
2. The backend generates the reward based on:
    * run seed
    * current floor
    * player state summary
    * battle result
    * server private key / key salt
3. The backend returns the reward result and a signature to the client
4. The client submits that on-chain
5. The on-chain program verifies that the result was signed by an authorized settlement service

#### Pros

* Simple
* Fast to build
* More than enough for a hackathon
* Stops most cheating that comes from modifying frontend probabilities

#### Cons

* You have to trust your own backend
* This is “centralized fairness,” not “publicly verifiable fairness”

#### Is It Suitable for You Right Now?

**Very suitable.**

* * *

#### Option 2: Use Verifiable Randomness for Rewards (VRF / Commit-Reveal)

This is the **more orthodox on-chain fairness solution**.

Switchboard’s Solana randomness docs and tutorials are explicitly built around **verifiable randomness** and **commit-reveal** patterns. The core goal is to make sure results cannot be changed by the client at will.

A possible flow:

1. At the start of a run, put `seed_commit` on-chain
2. When a key reward event is triggered, request VRF / randomness
3. After the random value is returned, the program computes the drop from a fixed table
4. Rare rewards are issued by the program or by settlement logic constrained by the program

#### Pros

* Strong fairness narrative
* Very good for explaining the value of the chain to judges

#### Cons

* Higher integration complexity
* More sensitive to game pacing and engineering time
* Not suitable for every small reward

#### Is It Suitable for You Right Now?

**Use it only for high-value drops, not for everything.**

For example:

* Legendary card drops after a boss
* Seasonal reward boxes
* First-clear rare relics

Do not use it for normal white/blue cards.

* * *

#### Option 3: Keep Combat Fully Off-Chain, But Make the Run Replay Verifiable Afterward

This is a compromise:

1. Fix the initial seed for the whole run
2. Derive all randomness from that seed using a public PRNG
3. Have the client record the full action sequence
4. Let a backend or challengers replay the run
5. If the replayed result does not match the submitted result, mark it as cheating

#### Pros

* Smooth gameplay
* Elegant design
* Very good for a daily challenge seed mode

#### Cons

* You must achieve **fully deterministic simulation**
* Frontend/backend versions, floating-point behavior, and randomness call order all have to match exactly
* You still need a mechanism for “who audits the replay”

#### Is It Suitable for You Right Now?

Suitable for phase two, but not as the first security foundation.

* * *

#### My Direct Judgment on Your Question

#### If Your Current Design Is:

* The drop rate is hard-coded in the frontend
* The frontend rolls randomness by itself
* The frontend decides the reward by itself
* Only the final deck is submitted at the end of the run

Then the answer is:

**Yes, it will be quite hard to detect if someone tampers with the rare drop rate.**

It is not completely impossible to detect, but in practice you would usually only catch it through:

* Statistical anomalies
* Manual replay spot-checking
* Obviously unreasonable outputs

That is not stable enough.

* * *

#### So What Is “Good Enough” for a Hackathon?

I recommend tiering rewards:

#### Category A: Low-Value Rewards

For example:

* Standard “pick 1 of 3” rewards after normal fights
* Regular gold
* Low-rarity relics

**These can be generated off-chain.**  
Even if someone farms a little, it will not destroy the demo.

#### Category B: High-Value Rewards

For example:

* Legendary cards
* Special skins
* On-chain achievements
* Rare events that affect leaderboard score
* Mintable assets

**Do not let the client decide them directly.**

At least use one of these:

* Server-signed settlement
* VRF / commit-reveal settlement

#### Category C: True On-Chain Assets

For example:

* NFT relics
* Season-limited rewards
* Rare titles

**Their issuance conditions must be controlled either by the on-chain program or by a trusted settlement service.**

* * *

#### The Most Practical Solution I Would Give You

#### Recommended Hackathon Version

#### Combat Process

Fully off-chain

#### Normal Rewards

Calculated off-chain

#### Rare Rewards

Settled and signed by the backend

#### On-Chain Submission

Include the following when submitting:

* run_id
* score
* floor_reached
* deck_hash
* relic_hash
* reward_signature (if rare rewards are involved)

#### On-Chain Program Checks

* Whether the run exists
* Whether it is a duplicate submission
* Whether the backend signature is valid
* Whether the rare reward matches the signed payload

That way, even if someone changes the local drop rate, they still **cannot obtain a valid signature**, so they cannot turn a forged rare reward into an official on-chain result.

* * *

#### If You Want a Stronger “Fairness” Narrative

You could say this in a demo pitch:

> Normal combat and deck-building happen off-chain to preserve the fluid gameplay experience of a roguelike; however, all high-value drops, rare rewards, and season-related outcomes are generated through a controlled settlement flow and validated by signature checks or verifiable randomness before being submitted to Solana, preventing forged assets caused by client-side drop-rate tampering.

That sounds like something a mature project would say.

* * *

#### One Final, Most Important Judgment

**“Only putting the run on-chain after it ends” is not the real problem; the real problem is “who decides high-value random outcomes.”**  
If the answer is “the client decides,” then yes, cheating is genuinely hard to detect.  
If the answer is “a server signs it” or “verifiable randomness decides it,” then you can reduce the risk to an acceptable hackathon level.

My next message could directly give you a **rare-drop security design diagram**, including:

* Client
* Game backend
* Anchor program
* Submission fields
* Signature validation field format

* * *

### fffg

1. I do not want to add a backend, because that feels too centralized.  
2. Is it possible to use a Slay the Spire–style randomness model—basically what you mentioned, where a seed controls all drops in the entire run—so the chain only needs to validate against the seed to determine whether cheating happened? What are the drawbacks of that approach?

* * *

### ChatGPT

Your direction is **correct**, and it is currently one of the most **elegant** decentralized solutions available:

> **Use a seed to determine all randomness in the run → make the game fully deterministic → let the chain only verify the result**

At its core, this is:  
**Deterministic Roguelike + Verifiable Replay / Proof**

A lot of systems inspired by **Slay the Spire + fair competition** go in exactly this direction.

* * *

#### Conclusion First

✅ **Yes, it can be done, and it fits your game type very well**  
❗ But it is not “without flaws”—it has several very important traps:

> **The biggest issue is not “can it be verified,” but:**  
> 👉 **how to stop players from cherry-picking seeds / brute-forcing starts / seeing the future in advance**

Let me unpack it fully below.

* * *

#### I. How This Approach Actually Works (The Standard Model)

What you want is:

#### 1️⃣ Run Start

* Generate a `seed`
* The seed determines:
    * All drops
    * All random events
    * Enemy behavior (if you want)
    * Shop contents
    * Card rewards

#### 2️⃣ Game Process (Off-Chain)

* All randomness comes from:

```text
rng = PRNG(seed)
```

#### 3️⃣ Run End

Submit:

* seed
* the player’s action sequence (or its hash)
* the final result

#### 4️⃣ Verification

Verify by:

* Re-running with the seed
* Checking whether the same result is produced

👉 If it matches → legal  
👉 If it does not → cheating

* * *

#### II. The Core Advantages of This Approach

#### ✅ 1. Fully Decentralized

* No backend needed
* No VRF needed
* No oracle needed

#### ✅ 2. A Great Fit for Roguelikes

Because:

* Card games naturally have discrete state
* Full determinism is achievable

#### ✅ 3. It Can Be “Verifiably Fair”

You can even say:

> “All runs are replayable and verifiable.”

That is a **major plus** in a hackathon setting.

* * *

#### III. But It Has Three Fatal Problems (Important)

#### ❗Problem 1: Players Can “Pick Seeds” (The Biggest Trap)

If the seed is generated by the player or is predictable:

#### The player can:

* Re-roll seeds repeatedly
* Find one where:
    * The opening gives broken cards
    * Rare drops appear early
    * The boss is easy

And then only submit the “good” run

👉 This is called:  
**seed grinding / cherry-picking**

* * *

#### A Simple Example

If the seed is:

```text
seed = current_timestamp
```

Then the player can:

* Start runs repeatedly
* Check the first few floors’ drops
* Quit if it looks bad
* Continue only if it looks good

👉 That destroys the leaderboard.

* * *

#### ❗Problem 2: Players Can “See the Future”

Because:

```text
seed → all randomness is predetermined
```

The player can:

* Simulate the whole run in advance
* Know:
    * What the next card will be
    * What the next floor’s reward will be
    * Which route is optimal

👉 This is called:  
**perfect foresight**

And it will:

* Reduce the fun of the game
* Turn it into a “solver game”

* * *

#### ❗Problem 3: The Chain Cannot Really Re-Run Complex Logic

You said:

> “As long as the chain recomputes it, it can determine whether cheating happened.”

That is theoretically true, but in practice:

#### Solana is not suitable for:

* Re-running a whole roguelike
* Large loops
* Complex state machines

Because of:

* Compute budget limits
* CU costs
* Account read/write limits

👉 So in practice:

**the chain usually does not replay the whole run**

Instead, it only verifies:

👉 **summaries (hashes / signatures / commitments)**

* * *

#### ❗Problem 4 (An Engineering Trap): Everything Must Be Fully Deterministic

You must guarantee that all of these are consistent:

* Floating-point math → ❌ must be avoided
* Random call order
* Array iteration order
* JS vs Rust behavior
* Behavior across different devices

Otherwise:  
👉 The replay result will diverge → false cheating flags

* * *

#### IV. How to Fix These Problems (Key Design)

#### ✅ Fix for Problem 1: Prevent Seed Picking (Most Important)

#### Method A: Commit the Seed On-Chain (Recommended)

Flow:

#### Step 1: The player first submits the hash

```text
commit = hash(secret_seed)
```

#### Step 2: Start the game off-chain

Using:

```text
seed = hash(secret_seed + run_id)
```

#### Step 3: Reveal at the end

Submit:

```text
secret_seed
```

The chain verifies:

```text
hash(secret_seed) == commit
```

👉 The player cannot change the seed midway through the run.

* * *

#### Method B: Generate the Seed On-Chain (Simpler)

For example:

```text
seed = hash(
  player_pubkey +
  slot +
  recent_blockhash
)
```

👉 The player cannot fully control the seed

But:

* It can still be partially predicted (this is the weakness)

* * *

#### Method C: Daily Seed (Best for You)

Like Slay the Spire:

* One seed per day
* Everyone uses the same seed
* Compete on a leaderboard

👉 Advantages:

* Completely fair
* No seed rerolling

👉 I strongly recommend adding this mode.

* * *

#### ✅ Fix for Problem 2: Prevent Future Knowledge

You have a few options:

#### Option 1: Accept It (Most Realistic)

Slay the Spire itself is technically predictable too.

👉 Most players will not actually compute the whole future.

* * *

#### Option 2: Delayed Reveal

For example:

* Split the seed by floor:
    * floor 1 seed
    * floor 2 seed
* Reveal only one floor at a time

👉 More complex; not recommended for a hackathon

* * *

#### ✅ Fix for Problem 3: How the Chain Should Verify

Do not ask the chain to replay the whole run.

Instead, submit:

* seed
* run_hash (hash of the whole process)
* final_state_hash

And let the chain verify only:

* That the seed is valid
* That the run was not submitted twice
* That the signature is correct

#### Replay Verification

Do it off-chain (client / community / verifier)

👉 This is the realistic path.

* * *

#### ✅ Fix for Problem 4: Deterministic Design Rules

You must enforce the following:

* ❌ No floating-point math → use integers
* ❌ No `Math.random()`
* ✅ Use a fixed PRNG (such as xorshift / splitmix)
* ✅ Fix the order of all random calls
* ✅ Make all logic pure-functional

* * *

#### V. The Final Structure I Recommend for a Hackathon

#### ✅ Mode 1: Normal Run (Light Verification)

* seed = generated on-chain
* game runs off-chain
* submit result
* no strong validation for drops

👉 Used for gameplay experience

* * *

#### ✅ Mode 2: Daily Challenge (Strong Verification ⭐)

* Fixed seed (on-chain or public)
* Players submit:
    * action hash
    * result
* Leaderboard compares runs under the same seed

👉 This is the mode you should prioritize most.

* * *

#### ✅ Mode 3: Rare Rewards (Strict Control)

* Rare drops:
    * generated deterministically from seed
* On-chain validation:
    * seed is valid
    * drop matches the rules

👉 No backend required

* * *

#### VI. One-Sentence Summary

Your core idea is:

> **Turn “randomness” into “determinism,” then turn the “verification problem” into a “replay problem.”**

That is a very correct direction.

But you must solve three things:

1. **The seed cannot be cherry-picked**
2. **Players must not be able to easily compute the entire future in advance (or you accept that tradeoff)**
3. **The chain should do light verification, not heavy recomputation**

* * *

#### VII. My Recommendation to You (Very Clear)

👉 For the hackathon version:

* ✅ Use a seed to control the whole run
* ✅ Build a daily-seed mode
* ✅ Use on-chain commit / reveal or on-chain seed generation
* ✅ Avoid a backend
* ❌ Do not do on-chain replay
* ❌ Do not put each step on-chain

👉 What you get:

* Decentralization ✅
* Verifiable fairness ✅
* Controllable engineering scope ✅
* A good demo story ✅

* * *

If you want, my next step could be to help you design:

👉 **A complete deterministic RNG + drop table + seed derivation structure (with code-level design)**

That will directly define the “soul” of your whole game system.

* * *

### fffg

Regarding the on-chain verification part, how would you actually use a seed to verify an entire run? A single run may contain several battles, multiple choices, and even different card choices in every battle. Is full verification really possible?

* * *

### ChatGPT

Let me split the question of “whether it can be verified” into two parts first: in theory, yes, **but you should not fully replay an entire run on Solana itself**. I’ll first confirm the latest official wording around compute budget and transaction limits, then give you a verification architecture that can actually be implemented.

* * *

### ChatGPT

Yes, it can be verified—but you need to distinguish between two meanings of “verification”:

1. **Can the entire run be replayed mathematically?** Yes.
2. **Should Solana replay the full run on-chain?** Usually no.

The core reason is that a single Solana transaction has a limited compute budget. The official docs currently state a default of 200,000 CU per non-built-in instruction and a maximum of 1,400,000 CU per transaction; priority fees are also charged based on the CU limit you request, not the amount you actually use. For a roguelike with multiple battles, many reward resolutions, route choices, and card choices, stuffing a complete replay of the whole run into a single on-chain verification is usually very tight—and often unrealistic.

#### Conclusion First

**The practical solution is not “replay the entire run on-chain,” but rather “make the run replayable off-chain and let the chain only verify light commitments.”**

You can design the system like this:

* **The seed determines all randomness in the run**
* **Game logic is fully deterministic**
* **The client saves the action sequence**
* **Anyone can replay the full run off-chain**
* **The chain verifies only a small number of commitments and result summaries**

That is something you can actually build.

* * *

#### What Does It Mean to “Use a Seed to Verify an Entire Run”?

As long as you write the whole game as a deterministic state machine, it can be verified.

Formally, it looks like this:

```text
state_0 = init(seed, ruleset, player_loadout)

state_1 = step(state_0, action_1)
state_2 = step(state_1, action_2)
...
state_n = step(state_{n-1}, action_n)
```

Here:

* `seed` determines all randomness
* `action_i` is the player’s i-th action
* `step()` is a pure function
* The same `seed + the same action sequence` must always produce the same final result

So even if a single run contains:

* 3 battles
* 8 reward choices
* multiple route branches
* different draws and drops in each battle

As long as all of them come from the same deterministic rule system, they can all be replayed and verified.

* * *

#### The Real Key Is Not How Many Battles There Are, But These 4 Things

#### 1. All Randomness Must Be Derived from the Seed

You cannot mix in any local randomness, such as:

* `Math.random()`
* current time
* frame rate
* device-specific differences
* network response order

You should structure it more like this:

```text
rng_master = PRNG(seed)
battle_seed_1 = hash(seed, "battle", 1)
reward_seed_1 = hash(seed, "reward", 1)
shop_seed_1   = hash(seed, "shop", 1)
```

In other words, do not just let one global PRNG `next()` forever; instead, **derive seed branches by domain/event type**.

That has major advantages:

* One module calling randomness one extra time will not pollute all future randomness
* It is easier to debug
* It is easier to verify

* * *

#### 2. The Game Logic Must Be Fully Deterministic

This is the most important point.

You must avoid:

* Floating-point math
* Unstable sorting
* Depending on object iteration order
* JS/Rust edge-case behavior differences

It is best to standardize on:

* Integers for all numbers
* Explicit fixed sorting rules
* Fixed event processing order
* Fixed randomness call points

Otherwise, you will hit a very annoying problem:

**Not that the player cheated—but that your own replay disagrees with itself.**

* * *

#### 3. You Must Record the Action Sequence, Not Just the Final Result

Submitting only:

* Final score
* Final deck
* Final relics

is not enough.

Because under the same seed, different mid-run choices can lead to completely different endings.  
So at minimum, you need:

* Route choices
* Reward-pick choices
* Shop purchases
* In-battle actions such as play card / end turn / target selection
* Key actions like discarding / using consumables

The simplest approach is to encode a run as a sequence of actions:

```text
[
  choose_path(2),
  reward_pick(1),
  play_card(card_7, target_0),
  end_turn,
  play_card(card_3, target_1),
  ...
]
```

With `seed + action log`, you can fully replay the run off-chain.

* * *

#### 4. The Ruleset Version Must Be Fixed

Otherwise you hit another problem:

* The player played on v0.1.2
* You verify it later on v0.1.3

Then the replay may produce a different result immediately.

So every run should bind to:

* `ruleset_version`
* `content_hash`
* `drop_table_hash`

At minimum, the chain should store one of these summary values.

* * *

#### Why Full On-Chain Replay Is Not Recommended

Because your run may contain hundreds of state transitions.

And on Solana, both transaction fees and priority fees depend on the compute budget you request; the official docs explicitly say that priority fees depend on the requested CU limit, not the actual usage. So even if you somehow manage to force a replay onto the chain, the cost, failure rate, and development complexity will all look bad.

The more practical issues are:

* One replay may contain many loops
* Each turn may need to process multiple cards, status effects, and drop logic
* After several battles are stacked together, CU usage can blow up easily
* If validation fails, the transaction still costs money; Solana’s official fee docs explicitly state that failed transactions still incur fees

So the architecture should avoid “replay the full run on-chain.”

* * *

#### A Verification Architecture That Can Actually Be Implemented

#### Option A: Full Replay Off-Chain, Summary Validation On-Chain

This is my top recommendation.

#### On-Chain at Run Start

Submit a `RunCommit`:

* player
* run_id
* seed_commit or daily_seed_id
* ruleset_hash
* deck_init_hash

#### Off-Chain During the Game

Save locally:

* action log
* intermediate state hash chain

#### On-Chain at Run End

Submit:

* run_id
* final_score
* final_state_hash
* action_log_hash
* optional replay_root

#### The Chain Only Verifies

* Whether the run was registered
* Whether the seed matches the commitment
* Whether the ruleset hash matches
* Whether the final submission is structurally valid
* Whether it is a duplicate submission

#### The Real “Full Verification”

That is done by off-chain verifiers:

* The local client
* Community observers
* Tournament judge scripts
* Anyone who downloads the action log and replays it

This is “publicly verifiable,” but not “executed step-by-step on-chain.”

* * *

#### Option B: Segment Verification Instead of Whole-Run Verification

If you really want the chain to participate more, you can split a run into segments:

* map segment
* battle segment
* reward segment

At the end of each segment, generate a `segment_hash`:

```text
segment_1 = hash(seed_1, actions_1, state_end_1)
segment_2 = hash(seed_2, actions_2, state_end_2, segment_1)
...
```

Then the chain only receives:

* the first segment commitment
* the final segment summary
* or a small number of checkpoints

That is more stable than “verify the whole run once” and easier to audit selectively.

* * *

#### So Is It Possible to Verify? Yes—but Think of It as a Replayable Proof

You should not define the goal as:

> Re-run the whole game inside a Solana program

You should define it as:

> Generate a proof package for each run that anyone can replay off-chain, while the chain stores only commitments and result summaries

* * *

#### A Concrete Design Suitable for You

#### 1. Seed Structure

```text
master_seed
map_seed      = H(master_seed, "map")
battle_seed_i = H(master_seed, "battle", i)
reward_seed_i = H(master_seed, "reward", i)
shop_seed_i   = H(master_seed, "shop", i)
```

#### 2. What a Run Log Contains

```text
RunProof {
  run_id,
  ruleset_hash,
  master_seed_reveal,   // or a reference to the daily seed
  initial_loadout_hash,
  actions[],
  checkpoints[],
  final_state_hash,
  final_score
}
```

#### 3. Checkpoints

Record one at the end of each battle:

```text
Checkpoint {
  index,
  phase_type,           // battle / reward / shop / route
  start_state_hash,
  actions_hash,
  end_state_hash
}
```

#### 4. What to Store On-Chain

Only store:

* player profile
* run commit
* run result summary
* final_state_hash
* action_log_hash
* maybe checkpoint_root

#### 5. Who Performs Verification

* The frontend can replay locally with one click
* An open-source verifier script can replay the run
* Top-N leaderboard runs must submit a full proof package for public review

That is decentralized enough.

* * *

#### The Drawbacks of This Approach

#### Drawback 1: The Chain Does Not Automatically Determine Truth

The chain itself will not compute the entire run for you.  
Strictly speaking, this is:

**on-chain commitment + off-chain verifiability**

not “pure on-chain execution.”

#### Drawback 2: Proof Packages Get Large

A full run can contain many actions, so the log size can become large.  
Typical solutions are:

* Store only the hash on-chain
* Store detailed logs locally or on decentralized storage
* Require full logs only for high-ranking runs

#### Drawback 3: Your Rules Must Be Extremely Cleanly Structured

This is the determinism requirement mentioned earlier.  
In practice, that is the biggest engineering challenge.

* * *

#### The Most Realistic Recommendation for Your Game

#### Hackathon Version

Build this:

* **Daily challenge mode**
    * One public seed per day
    * Everyone uses the same seed
    * Submit final result + action_log_hash
    * Top-ranked players publish the full replay
* **Normal run mode**
    * No strong verification
    * Only lightweight on-chain recordkeeping

That gives you both:

* A mode that is genuinely verifiable and easy to explain
* A more free-form, fun normal mode

That is far more realistic than trying to make **every mode** heavily verified on-chain.

* * *

#### Final Sentence

**The fact that a run contains several battles, many choices, and lots of card decisions does not prevent verification; what determines whether it can be verified is whether you can write the whole run as a “seed-driven + action-driven + fully deterministic” state machine.**  
But on Solana, the most reasonable implementation is not “replay the entire run on-chain,” but rather “replay the full run off-chain while the chain only verifies commitments and summaries.” That also fits Solana’s actual compute budget and fee model much better.

My next step could be to draw out a **RunProof data structure + battle-checkpoint hash-chain design** for you.

* * *

### fffg

So what you mean is that the chain only verifies simple things like whether the seed and status values are legal, while actual cheating is determined through off-chain verification. But then I think a leaderboard built this way would end up with lots of cheaters. Even if off-chain verification can prove they cheated, how do you broadcast that back to the chain, modify consensus, and change the leaderboard?

* * *

### ChatGPT

You have identified the key point: **if the protocol does not define an on-chain “appeal / challenge / leaderboard rollback” flow from the beginning, then once cheating is discovered later, the chain will not automatically fix the leaderboard.** I’ll first confirm the latest official wording around Solana programs, account state, and transaction execution, then give you a “challengeable leaderboard” design that can actually be implemented.

* * *

### ChatGPT

Yes, your understanding is very accurate:

**If the chain only verifies whether the seed / format / summary is self-consistent, then it can only stop “obviously invalid submissions,” not “process-level cheating that still produces a plausible-looking summary.”**  
And more importantly, **if the protocol never predefines an on-chain flow for “challenge → judgment → leaderboard update,” then afterward you cannot change consensus just by saying, “he cheated.”** In Solana, the program itself is stateless, all mutable state lives in data accounts, account data can only be rewritten by its owner program through instructions, and transactions execute atomically. So whether a leaderboard can be corrected depends on whether you wrote executable correction rules into the program in advance.

So the answer is not “after detecting cheating off-chain, how do you broadcast it back to the chain so the chain automatically changes the leaderboard?” The real answer is:

#### You Need to Design the Leaderboard as a “Challengeable Leaderboard,” Not an “Instantly Final Leaderboard”

The most practical way is to split the leaderboard into two layers:

#### Layer 1: Provisional Board

After a player submits a run, it first enters a **pending / provisional leaderboard**.  
At this stage, the chain only checks:

* Whether the run has been registered
* Whether the seed / commit matches
* Whether the submission format is correct
* Whether the basic summary is self-consistent

These are the kinds of checks that fit the chain well, because they involve only a small number of accounts and fields. Solana transactions and instructions are executed based on **explicitly passed accounts + explicit instruction data**; the chain will not magically read an entire external gameplay process for you.

#### Layer 2: Final Board

Give each run a **challenge window**, such as 1 hour, 24 hours, or “until the daily challenge ends.”  
Within that window, anyone can challenge the run by submitting:

* The full action log of the run or a retrievable reference to it
* The challenge type
* Evidence of cheating
* A required bond

If the window expires without a successful challenge, the entry moves from provisional to final leaderboard status.  
This is not “changing consensus”; it is simply that **the leaderboard account itself is still in a protocol-defined non-final state**, and later it is legitimately advanced to final by program instructions. In Solana, state is just account data. As long as the program is called and has writable access to the account, it can update that state according to the rules you defined.

* * *

#### In Other Words: This Is Not “Broadcasting Proof to Undo History,” but “Triggering an In-Protocol Dispute Flow Before History Becomes Final”

Those are two completely different things.

You cannot expect this:

* Someone runs a verifier off-chain
* Posts on X saying someone cheated
* The chain automatically invalidates the old transaction

Because once a Solana transaction has executed successfully, the chain will not let the application layer arbitrarily roll it back. What the application layer **can** do is send **a new valid transaction** to update your leaderboard account, mark a run as invalid, slash a bond, and recalculate ranking. Transactions are atomic, and rollback only occurs when the **current** transaction fails—not because someone later disagrees with a previous application-level state.

* * *

#### What You Really Need Is an “Optimistic Submission + Challenge Period + Resolution” Protocol

I recommend structuring it like this.

#### Scheme: Optimistic Leaderboard

#### 1. `submit_run()`

The player submits:

* `run_id`
* `seed_commit` or `daily_seed_id`
* `result_summary`
* `score`
* `final_state_hash`
* `action_log_hash`
* `proof_uri` or `proof_root`
* a `bond`

After light validation, the chain:

* Creates `RunRecord { status = Pending }`
* Places it on the provisional leaderboard
* Records a `challenge_deadline`

#### 2. `challenge_run()`

Within the allowed period, a challenger submits:

* `run_id`
* `challenge_type`
* `evidence_hash` / `proof payload`
* a challenge bond

The chain updates the run status to:

* `UnderChallenge`

#### 3. `resolve_challenge()`

There are two possible paths here:

#### Path A: Challenges That Can Be Resolved On-Chain

Only handle cheating types that the chain can validate cheaply, such as:

* Seed reveal does not match commit
* Cards outside the allowed pool
* Final relic count exceeds the rules
* Impossible score
* Checkpoint hash chain is broken
* Obvious state-transition boundary violations

These can be directly judged by the program:

* challenge succeeds → run becomes `Invalid`
* challenger gets the bond back and receives a reward
* submitter’s bond is slashed
* leaderboard is updated

#### Path B: Cheating That Is Verifiable Off-Chain but Executable On-Chain

More complex cheating—such as secretly changing drop rates mid-run—is usually not suitable for full on-chain replay.  
In that case, your protocol needs a **judgment entry point**, for example:

* A multisig judge committee
* Committee signatures
* Or later, if you ever build zk / proof infrastructure, proof verification

They run the verifier off-chain, determine that cheating happened, and then call:

* `slash_run(run_id, signed_verdict)`
* or `resolve_challenge(run_id, verdict)`

So what gets “broadcast back to the chain” is not public opinion—it is **a judgment instruction that conforms to your protocol.**

* * *

#### That Directly Answers Your Main Concern

What you are worried about is:

> Will the leaderboard just fill up with cheaters first, and even if we know off-chain that they cheated, there is no way to fix it on-chain?

The answer is:

**If you build an “instantly final leaderboard,” yes, that can happen.**  
**If you build a “challengeable optimistic leaderboard,” then it does not become a fatal problem.**

Because in the latter design:

* New scores start as `Pending`
* Only after the challenge window do they become `Final`
* Successfully challenged entries never reach the final board
* Even after something becomes final, if the protocol allows it, you can still mark it `Slashed/Invalidated` through a dedicated penalty / invalidation instruction

* * *

#### But There Is a More Realistic Judgment Here

#### If You Do Not Want Centralization, and Also Do Not Want Full On-Chain Replay

Then you must accept one reality:

**There will always be a question of who has the authority to determine cheating in the final step.**

Because `seed + final summary` alone is not enough to let the chain automatically judge every kind of process-level cheating.  
At minimum, you must choose one of these tradeoffs:

#### Option A: Only Support Cheat Types That the Chain Can Judge by Itself

Advantages:

* Most decentralized
* Cleanest design

Disadvantages:

* Limited range of catchable cheats
* Many process-level cheats still slip through

#### Option B: Add a Challenge Committee / Arbitration Multisig

Advantages:

* Actually usable
* Can handle more complex cheating

Disadvantages:

* Adds some centralization

#### Option C: Use a Stronger Proof System

For example, later you might build:

* zk proofs
* or an extremely strong verifiable replay proof

Advantages:

* Ideal in theory

Disadvantages:

* Almost impossible within hackathon scope

* * *

#### The Most Reasonable Practical Structure for Your Project

I recommend separating modes.

#### Normal Mode

Do not build a strong-consensus leaderboard. Only do:

* On-chain score display
* Community rankings
* No high-value rewards tied to it

That way, even if someone cheats, they only pollute the display layer, not asset security.

#### Daily Challenge Mode

This is where you build your “serious leaderboard”:

* Fixed daily seed
* Mandatory `action_log_hash`
* Top N players must publish a full replay
* Leaderboard starts as Pending
* Becomes Final after the challenge period
* Only the Final leaderboard issues rewards

#### High-Value Rewards

Only issue them from the Final leaderboard:

* NFT / achievement
* Seasonal rewards
* Rare relic skins

That way, you concentrate the hardest problem onto a small number of high-value runs instead of requiring perfect on-chain judgment for every run.

* * *

#### A Very Practical On-Chain State Design

#### `RunRecord`

```rust
status: Pending | UnderChallenge | Final | Invalid
submitter: Pubkey
score: u64
seed_commit: [u8; 32]
action_log_hash: [u8; 32]
final_state_hash: [u8; 32]
proof_root_or_uri_hash: [u8; 32]
challenge_deadline: i64
bond: u64
```

#### `ChallengeRecord`

```rust
run_id: u64
challenger: Pubkey
reason_code: u8
evidence_hash: [u8; 32]
status: Open | ResolvedSuccess | ResolvedFail
bond: u64
```

#### `LeaderboardEntry`

Do not hard-code ranking positions as fixed state.  
A better approach is:

* When reading the leaderboard, count only runs with `Final` status
* `Pending/Invalid` runs do not participate in final reward settlement

That way, you do not even need to constantly “re-sort the on-chain leaderboard data structure”; the frontend or an indexer can derive the final leaderboard from statuses.

* * *

#### Let Me Slightly Correct the Phrase “Modify Consensus”

From an application-design perspective, this is not “modifying consensus,” but:

**updating application state through a new transaction.**

Solana’s consensus layer is responsible for:

* Which transaction gets included
* How account state transitions according to the rules

Your program is responsible for:

* What counts as pending
* What counts as final
* What counts as invalid
* Who can challenge
* What evidence is valid
* How slashing and leaderboard correction happen after a successful challenge

So the essence of this is **protocol design**, not the base chain’s consensus magically rescuing you.

* * *

#### One Very Clear Final Recommendation

If you do not want a centralized backend, and you also do not want the leaderboard to be full of cheaters:

**then do not build an instantly final leaderboard.**  
Build this instead:

**`submit -> Pending -> challenge window -> Final -> reward issuance`**

This is the single most important protocol design line in your project.  
Without it, “off-chain verifiability” is basically just a slogan. With it, “off-chain verifiability” becomes a mechanism that can actually affect on-chain outcomes.

My next step could be to define a **challengeable leaderboard protocol** for you, including the sequence diagram and Anchor instruction design for `submit_run / challenge_run / resolve_run / finalize_run`.

* * *

### fffg

If we follow the idea of a final leaderboard, I have two questions:  
1. For a small hackathon project, would anyone actually act as a verifier?  
2. Once you introduce a verifier mechanism, doesn’t that inevitably bring in an economic layer and push the project from a pure game toward GameFi, which feels too complicated for a hackathon?

As for the economy part, my current idea is that players start a game and pay gas; if they succeed, they receive an NFT card, most likely common and occasionally rare. Several common ones can be randomly combined into a rare one. Then there could be a separate mode where players battle using these NFTs, with the winner taking one NFT from the loser and destroying the loser’s other NFTs. There is also the earlier daily challenge mode. These online battle parts are not within hackathon scope for now. I want to know whether this mechanism is reasonable.

* * *

### ChatGPT

Let me give you the conclusion first, then help tighten the logic into something that is actually feasible for a hackathon.

* * *

#### I. Your Two Concerns (Both Very Important)

#### ❓1. Will Anyone Actually Act as a Verifier?

**No. At least during the hackathon phase, basically not.**

The reality is:

* No incentives → no one verifies
* Incentives → now you are in complicated economic design
* Leaderboard without verification → credibility drops

👉 So there is one important thing to correct in your mental model:

> ❌ “Off-chain verifiable” ≠ someone will automatically verify it  
> ✅ It only means “**it can be verified if needed**”

* * *

#### ❓2. Will a Verification Mechanism Push the Project Toward GameFi?

**Yes. If you build a full challenge / bond / arbitration mechanism, it will clearly shift toward GameFi.**

And also:

* A hackathon usually does not give you enough time
* Complexity explodes
* The project easily turns into an “economic design project” rather than a “game project”

👉 So your instinct is correct:  
**you should not build a full verification economy system during the hackathon**

* * *

#### II. So What Is the Realistic Solution?

#### 👉 Core Strategy (Very Important)

#### **Do Not Treat “leaderboard credibility” as the core selling point**

Instead:

> **Treat “gameplay experience + asset generation” as the core**  
> The leaderboard is just for display, not the basis of value settlement

* * *

#### III. Let Me Break Down the NFT Mechanism You Proposed

What you described is:

> * Players start a game → pay gas
> * If successful → they get an NFT drop (common / rare)
> * Common NFTs can be combined into rare ones
> * Later there is PvP using NFTs
> * Winners take NFTs from losers
> * Losers’ NFTs are destroyed

My direct judgment is:

#### 👉 The direction is right, but the current version has three major problems

* * *

#### IV. Problem 1: NFT Drops Are Still Unsafe (Critical)

Your current logic is:

> “A successful run → an NFT drops”

If that drop is determined by:

* The client
* A controllable seed
* No strong verification

Then the result is:

👉 **Players can farm NFTs**

For example:

* Modify the drop rate
* Repeatedly reroll seeds
* Find runs with inflated drop rates

The result:

* NFTs lose scarcity
* Rare cards flood the system
* The economy collapses

* * *

#### V. Problem 2: Your PvP Reward Model Is Too Aggressive (It Will Scare Players Away)

Your design is:

> The winner gets one NFT from the loser + all the loser’s remaining NFTs are destroyed

That is a huge problem.

#### ❗Why It Is a Problem:

* New players go bankrupt immediately
* Players will be afraid to participate
* “Lose once and get wiped out” feels terrible

👉 This is called:

**Full Loot PvP**

It is usually only appropriate in:

* hardcore blockchain games
* highly gambling-driven products

👉 For a game like yours, which is more strategy-card + roguelike:

**it does not fit**

* * *

#### VI. Problem 3: The Economy Still Does Not Form a Full Loop

Right now you have:

* NFT production (through runs)
* NFT consumption (through PvP loss)

But you do not yet have:

* control over production speed
* rarity stabilization mechanisms
* anti-farming mechanisms
* long-term value support

👉 In simple terms:

**this is not yet a complete economy system**

* * *

#### VII. So How Should You Change It into a “Hackathon-Reasonable Version”?

Let me give you the version that fits a hackathon best.

* * *

#### ✅ Version Goals

* No complex GameFi
* No dependency on verifiers
* No backend required
* NFTs have meaning without collapsing
* Demoable + easy to explain

* * *

#### VIII. Recommended Final Mechanism (A More Focused Version)

#### 🎮 1. Run → NFT (Core)

Change it to:

👉 **Only the daily challenge mode produces NFTs**

Why:

* The seed is fixed
* Seed rerolling is impossible
* Everyone is on equal footing
* No complicated verification is needed

* * *

#### Drop Rules:

```text
daily_seed + player performance → deterministic drop
```

For example:

* score > 1000 → common card
* score > 2000 → high chance of rare
* score > 3000 → guaranteed rare

👉 Make it fully deterministic, not probability-based

* * *

#### This Means You:

* ❌ Do not need verifiers
* ❌ Do not need to worry about probability tampering
* ✅ Only need lightweight validation of whether the score is reasonable

* * *

#### 🧪 2. Normal Mode

Normal runs:

* Do not drop NFTs
* Exist only for gameplay experience

👉 This prevents asset farming

* * *

#### 🧱 3. NFT Design (Important)

Do not start with complicated battle-oriented NFTs

Start with:

* Card NFTs (for collection + future expansion)
* or better yet, relic NFTs

* * *

#### Rarity Source:

```text
rarity = f(score, seed, rules)
```

Not probability.

* * *

#### 🔥 4. Fusion Mechanic (Keep It, But Change It)

Your original idea:

> Several commons → random rare

Change it to:

👉 **Deterministic crafting**

```text
3 commons + burn → 1 rare (fixed)
```

Or:

```text
combine common NFT attributes → new NFT
```

👉 Avoid randomness

* * *

#### ⚔️ 5. PvP (Do Not Do Full Loot for the Hackathon)

You can change it like this:

#### Version A (Recommended)

* Do not destroy NFTs
* Winners get:
    * experience / ranking
    * or a small reward NFT mint

#### Version B (Light-Risk)

* Losers lose:
    * 1 point of “durability”
* Only when durability reaches zero does the NFT burn

👉 This will not drive players away

* * *

#### 🏆 6. Leaderboard

Handle it simply:

* Display only
* Do not use it as the direct basis for NFT issuance

Or:

👉 Reward only the Top N (manual / soft verification is enough)

* * *

#### IX. The Most Reasonable Structure for Your Project (Final Version)

#### Mode Breakdown

#### 🎮 Normal Mode

* Free play
* No NFT output
* No on-chain record or only light recordkeeping

* * *

#### 🏆 Daily Challenge (Core)

* Fixed seed
* Deterministic drops
* The only NFT issuance entry point

* * *

#### 🎴 NFT System

* Cards / relics
* Rarity determined by score
* Deterministic crafting

* * *

#### ⚔️ PvP (Future)

* Not full loot
* Light economy
* Or purely competitive

* * *

#### X. Benefits of This Design

You solve all the core problems:

| Problem | Solution |
| --- | --- |
| No one verifies | You do not need verifiers |
| Drop-rate cheating | Use deterministic rules |
| Seed rerolling | Use a daily seed |
| Economy collapse | Control the issuance entry point |
| Game turns into GameFi | Keep gameplay first |
| Hackathon complexity | Reduce it to a buildable scope |

* * *

#### XI. One-Sentence Summary of Your Best Path

👉 **Do not try to make every run fair and trustworthy**

👉 Instead:

> **Make only the daily challenge mode the single trustworthy asset entry point**

That way you:

* Use the seed to create fairness
* Do not need verifiers
* Do not need a backend
* Do not need complicated economics
* Can still clearly explain the value of Solana

* * *

If you want, my next step could be to design the key part for you:

👉 **A full formula for “daily challenge + deterministic drops + NFT mint rules”**

Including:

* score → rarity function
* NFT metadata structure
* seed derivation rules
* anti-farming strategy

That will directly determine whether your demo feels like a real product.

* * *

### fffg

Your design is very good. My current plan for the hackathon is to finish the single-player mode, a daily leaderboard, and NFT minting for collection only, without PvP for now. About the daily leaderboard:  
1. Do you mean I do not need to worry about whether anyone will actually verify it, as long as I provide logic that can be completely and accurately verified?  
2. The score system would probably work like Slay the Spire, awarding points based on in-run behavior—but that seems to circle back to the verification problem, because in Slay the Spire’s daily challenge leaderboard, the top few ranks are full of cheaters every day. Slay the Spire does not mint NFTs, but in this game the NFT is connected to the leaderboard. Can the verification mechanism really carry that responsibility?

* * *

### ChatGPT

It can—but the responsibility boundary has to be made explicit.

#### Let Me Answer Your Two Questions First

#### 1. Do I Mean “You Don’t Need to Care Whether Anyone Actually Verifies It, As Long As It Is Fully and Precisely Verifiable”?

**For a hackathon, yes, that is basically the idea—but one extra sentence is important:**  
**You are not building a “strong-security leaderboard”; you are building a “leaderboard with verifiability.”**

Those are very different things.

If, during the hackathon phase, you achieve the following, that is already very good:

* The daily seed is fixed
* The whole run is fully deterministic
* There is a complete replay / action log
* Anyone can theoretically replay and verify it
* The frontend can export run proof / replay run

That means your leaderboard is **not a black box**, but something that is auditable.

But that does **not** mean:

* Someone will definitely audit it
* Cheaters will definitely be removed in time
* The leaderboard will definitely remain absolutely clean

So your selling point should be phrased more like this:

> We implemented a replayable and verifiable daily challenge system; the hackathon version provides public verification capability, but does not introduce a complex on-chain challenge economy or arbitration system.

That is honest, and it is also reasonable.

* * *

#### 2. If the Leaderboard Is Tied to NFTs, Can the Verification Mechanism Really “Carry the Responsibility”?

**If the NFT is strongly tied directly to leaderboard rank, then the current light-verification setup is not enough to carry that responsibility.**

This is the most important judgment.

Because once you have a mapping like this:

* Only Top 10 can mint a rare NFT
* The higher the rank, the rarer the NFT
* The leaderboard directly determines asset value

Then you have entered a new phase:

> **The leaderboard is no longer just a display layer; it becomes a value-allocation layer.**

And once it becomes a value-allocation layer, you can no longer rely on “theoretically verifiable.”

Because then the following can happen:

* Someone cheats their way onto the board
* Nobody verifies it in time
* The NFT has already been minted
* It becomes very hard to deal with afterward

At that point, **the verification mechanism must be able to actually affect the outcome**, not just allow someone to point out a problem locally.

So the answer is:

* **If the NFT is only a proof of participation, a collectible souvenir, or a challenge badge, light verification is enough**
* **If the NFT’s value depends heavily on leaderboard rank, light verification is not enough**

* * *

#### The Design Split You Should Make Right Now

#### Option A: Bind the NFT to “completion / score threshold”

This is the hackathon approach I recommend most.

For example:

* Complete the daily challenge → mint a common commemorative NFT
* Score 1000 → mint Bronze
* Score 2000 → mint Silver
* Score 3000 → mint Gold

In this design:

* The NFT is a **memorialized achievement**
* Not a **strictly scarce ranking prize**

That means even if the top few places on the leaderboard are polluted by cheaters, the NFT system suffers much less.  
Because the issuance criterion is a **threshold**, not a **relative rank**.

That dramatically lowers the burden on verification.

* * *

#### Option B: Bind the NFT to “final ranking”

For example:

* Only Daily Top 10 can mint
* Rank 1 gets a legendary NFT
* Top 100 gets rare NFTs

This makes the problem much harder, because then you must solve:

* When the leaderboard becomes final
* Who verifies the top ranks
* How to handle rollback after cheating is discovered
* How to revoke an NFT after it has already been minted

That clearly goes beyond hackathon comfort range.

* * *

#### So My Clear Recommendation Is

#### During the Hackathon:

#### Do Not Make “Leaderboard Rank Determines NFT”

Instead, do this:

#### “Daily challenge completion / score threshold determines NFT”

That is the most stable option.

* * *

#### Why This Is Much Better Than “Issue NFT by Leaderboard Rank”

Because you change the problem from:

> Who is the real rank #1?

into:

> Did this run reach a clear, explainable threshold?

The first requires strong verification, dispute handling, and finalization rules.  
The second only requires:

* Public scoring logic
* Exportable replays
* A basic anti-cheat structure

The complexity difference is enormous.

* * *

#### You Mentioned That the Top Ranks in Slay the Spire Daily Challenges Are Full of Cheaters, and That Actually Illustrates a Real Point

Even in mature games, if:

* The leaderboard is shown in real time
* There is no forced adjudication system
* There is no strong anti-cheat

then top ranks being polluted is very common.

But in Slay the Spire, that problem is not as fatal because:

* The leaderboard is only for honor
* It does not directly issue on-chain assets
* It does not involve tradable value

The moment you bind NFTs to it, the risk becomes much larger.

So you cannot directly copy the logic of “ordinary games can tolerate a somewhat dirty leaderboard” into “asset issuance.”

* * *

#### What Responsibility Should Your Verification Mechanism Actually Carry?

I recommend limiting it to this scope:

#### It Should Be Responsible For:

* Making the daily challenge seed public and transparent
* Ensuring that the game process is deterministic
* Ensuring that any run can theoretically be replayed
* Letting users export proof
* Making high-score runs reviewable

#### It Should Not Be Responsible For:

* Automatically removing all cheaters
* Automatically maintaining an absolutely trustworthy final leaderboard
* Automatically resolving all disputes
* Directly deciding the allocation of high-value assets

That makes the responsibility boundary reasonable.

* * *

#### A Rule Set That Fits Your Project Well

#### Daily Challenge

* Fixed daily seed
* Everyone uses the same seed
* The leaderboard is displayed in real time

#### NFT Issuance

Issue based on **achievement thresholds**, not rank.

For example:

* Complete the challenge: mint Common
* Reach score A: mint Uncommon
* Reach score S: mint Rare
* Clear without taking damage / satisfy a special restriction: mint Special Variant

This still lets you bind NFTs to daily mode, and it is easy to explain:

* The daily challenge becomes a verifiable, collectible on-chain achievement
* The NFT represents the player’s achievement tier for a given day’s challenge

That is a very good framing.

* * *

#### Then How Should You Design the Score System Without Falling Back into a Dead End?

You are right: **the more your score depends on minute in-run details, the harder it is to verify.**

So the hackathon version of the score system should follow one principle:

#### Do Not Make the Score Too “Fancy”

Do not create dozens of hidden bonuses.  
Try to derive the score from a small set of clear, replayable variables.

For example, use only:

* Floor reached
* Remaining HP
* Number of elite enemies killed
* Number of turns used
* Backpack efficiency rating
* Whether special objectives were completed

And avoid too many things like:

* Combo-level details
* Overly complex behavior rewards
* Lots of tiny bonus sources

The more complex it gets, the more expensive validation becomes.

* * *

#### I Recommend a Hackathon Score Formula Like This

```text
Score =
  floor_reached * 100
+ boss_kill_bonus
+ hp_remaining * 10
- turn_count * 2
+ elite_kills * 50
+ challenge_modifier_bonus
```

Characteristics:

* Easy to explain
* Easy to replay
* Easy to present
* Harder to hide loopholes in

* * *

#### Final Answer to “Can the Verification Mechanism Carry the Responsibility?”

**It can carry display-level and audit-level responsibility, but not final asset-allocation responsibility.**

In more direct words:

* It is enough to support a very polished hackathon demo
* It is enough to support the statement “we have public, precise, replayable daily run proof”
* It is **not** enough to support “we can issue high-value NFTs in a perfectly fair way based on final leaderboard rank”

So your best product strategy is:

#### Hackathon Version: Separate Responsibilities

#### Leaderboard:

Display, social competition, challenge feeling

#### NFT:

Commemorative, collectible, proof of achievement

#### Do Not Do:

Strong binding between high-value assets and leaderboard rank

That will make your whole system much smoother.

* * *

#### My Final Recommendation to You

Define the daily NFT as:

> **Daily Challenge Achievement NFT**

not:

> **Leaderboard Prize NFT**

Those two names imply completely different levels of protocol complexity.

The former is something you can build right now, and it is reasonable.  
The latter requires a full system for final verification and dispute handling, which is not suitable for a hackathon.

* * *

If you want, my next step could be to help you define:  
**the daily challenge NFT issuance rules + score formula + metadata fields**  
so the hackathon-deliverable version is locked in one shot.

* * *

### fffg

As for the NFT part, binding NFTs to thresholds really can reduce the impact of cheaters. I’m thinking: could I write data like the seed, actions, status, and so on into the metadata of the minted NFT, so that a cheating NFT could be easily verified as invalid and lose its value? Would that work?

* * *

### ChatGPT

I’ll first confirm the most commonly used way NFT metadata is currently carried on Solana, and then judge where the idea of putting `seed / action / status` into NFT metadata works—and where it falls short.

* * *

### ChatGPT

It is viable—but you need to separate two things very clearly:

**1. Writing proof data into NFT metadata can greatly improve “auditability”**  
**2. It does not automatically invalidate a cheating NFT, nor does it automatically make it lose value**

Do not mix those two things together.

* * *

#### Conclusion First

#### This Is a Path Worth Taking

You can absolutely bind things like the following to the NFT:

* `daily_seed_id` or `seed_commit`
* `ruleset_hash`
* `score`
* `final_state_hash`
* `action_log_hash`
* `proof_uri` or `replay_uri`
* `run_id`
* `minted_at`
* `verified_level`

That turns the NFT into a **verifiable challenge-achievement certificate**, rather than just a picture card.  
The common NFT metadata model on Solana today is that an on-chain metadata account stores basic fields and a `uri`, and that `uri` points to off-chain JSON; the official docs also make it clear that on-chain metadata usually stores only things like name, symbol, and URI, while extended information goes into the JSON referenced by the URI.

#### But Do Not Assume “Writing It In” Automatically Prevents Cheating

If a cheater can still mint the NFT, then:

* They can just as easily write fake `score`, fake `action_log_hash`, and fake `proof_uri` into it
* The NFT will still exist on-chain
* Wallets may still display it
* Marketplaces may not automatically treat it as “invalid”

So the real question is not “can this data be written into metadata?” but rather:

> **Who has minting authority, how much validation happens before minting, and how legitimacy is marked after minting.**

* * *

#### Why This Approach Has Real Value

#### Value 1: It Turns the NFT from “Picture Collectible” into an “Auditable Achievement”

This fits your hackathon positioning very well.

You can define the NFT as:

**Daily Challenge Achievement NFT**

Its metadata is not just:

* Name
* Image
* Rarity

It also includes:

* Which day’s daily seed it came from
* Which ruleset version it used
* The player’s score
* The replay proof address
* Whether it has been locally verified

That way, when someone receives the NFT, they are not just “looking at the picture”; they can trace where it came from.

* * *

#### Value 2: You Can Make the “Verification Status” Explicit Too

Instead of only storing raw data, a better approach is to add a field like this:

```json
{
  "attributes": [
    {"trait_type": "Daily Seed", "value": "2026-04-23"},
    {"trait_type": "Score", "value": 2480},
    {"trait_type": "Tier", "value": "Gold"},
    {"trait_type": "Ruleset Hash", "value": "0x..."},
    {"trait_type": "Action Log Hash", "value": "0x..."},
    {"trait_type": "Final State Hash", "value": "0x..."},
    {"trait_type": "Verification Status", "value": "Self-Reported"}
  ]
}
```

Then later, if you build a stronger verifier, you can upgrade the status to:

* `Self-Reported`
* `Replay-Published`
* `Community-Verified`
* `Officially-Verified`
* `Disputed`

That is extremely useful.

* * *

#### But What Are the Hard Limits of This Approach?

#### Limitation 1: NFT Metadata Is Not the Judge

In common Solana / Metaplex metadata structures, the chain stores:

* `name`
* `symbol`
* `uri`
* `creators`
* mutability, etc.

Detailed extended attributes usually live in the off-chain JSON referenced by the `uri`. Solana’s official docs also explicitly recommend storing the JSON in reliable persistent storage such as Arweave, IPFS, or a stable CDN.

That means:

* Metadata is a **description**
* It is not the place where validation rules are automatically executed

In other words, metadata can help people verify, but it will not enforce punishment for you.

* * *

#### Limitation 2: If Metadata Is Mutable, Cheaters May Also Change It; If It Is Immutable, You Cannot Easily Add Flags Later

The official docs explain that whether metadata is mutable depends on the `is_mutable` / update authority design; if the account is mutable, the update authority can modify the metadata.

So you will face a tradeoff:

#### Mutable Metadata

Advantages:

* Later, you can change `Verification Status` from `Pending` to `Verified/Disputed`

Disadvantages:

* You need an update authority
* That introduces some centralization
* Users may ask whether the official team can arbitrarily change NFTs

#### Immutable Metadata

Advantages:

* Feels more “hard”
* Stronger collectible narrative

Disadvantages:

* Once minted, it becomes very hard to add an official “this NFT is disputed” status later

* * *

#### Limitation 3: Market Value Does Not Automatically Come from “Including Proof”

When you say “a cheating NFT can be easily verified as invalid and lose value,” that is only true under one condition:

> **Your frontend, your community, and any relevant trading contexts must all recognize some shared verification standard.**

Otherwise, the chain only sees:

* A real mint that exists
* Real metadata that exists
* A URI that maybe contains fake proof

The chain will not automatically say “this one is void.”

So the more accurate way to say it is:

**Writing proof into NFT metadata makes legitimate NFTs easier to identify, but it does not guarantee that illegitimate NFTs automatically lose value.**

* * *

#### The Truly Reasonable Approach: Design “Validity” as a Readable State, Instead of Hoping the Market Understands by Itself

I recommend a two-layer design.

#### Layer 1: The NFT Stores the Proof

In the metadata JSON, store:

* `run_id`
* `day_id`
* `seed_commit`
* `ruleset_hash`
* `score`
* `action_log_hash`
* `final_state_hash`
* `proof_uri`

#### Layer 2: Add an “Officially Queryable Verification Status”

Do not let the NFT simply declare itself valid.  
A more stable approach is to let your game program or a separate registry account maintain:

* `mint -> Pending`
* `mint -> Verified`
* `mint -> Disputed`
* `mint -> RevokedForRewards` (if you need that later)

That way:

* The NFT itself still exists
* But your official website, leaderboard page, and in-game collection only recognize `Verified`

That is enough.

* * *

#### The Best Implementation for You in a Hackathon

#### Option A: Put Proof into NFT Metadata, and Treat the NFT as a “Souvenir” by Default

This is the most stable option.

#### Mint Conditions

* Daily challenge completed
* A score threshold is reached

#### Metadata Stores

* `daily_seed_id`
* `score`
* `tier`
* `action_log_hash`
* `proof_uri`
* `verification_status = "Unverified"` or `"Replay-Available"`

#### Frontend Display

* Your official site provides a “Verify this NFT” button
* When clicked, the frontend downloads the replay / action log locally
* If replay succeeds, the frontend displays “Replay matched”

That is already very good.

#### Even If a Cheater Exists

* They might mint some NFTs
* But your website does not have to display them as verified achievements
* The community can tell the difference

For a hackathon, that is already strong enough.

* * *

#### Option B: Mint First, Then Add Verification Status Later

If you want to go one step further, you can keep an update authority and later change the metadata status to:

* `Pending`
* `Verified`
* `Disputed`

Technically this is feasible, because mutable metadata can be updated.

But I would not recommend making that too heavy from the start.  
A simpler hackathon approach is:

* Keep metadata fixed
* Maintain verification status separately in an on-chain or off-chain registry

* * *

#### I Do Not Recommend Putting the Full Action Log Directly into On-Chain Metadata

This is an implementation detail, but an important one.

#### Do Not Do This

* Do not write the full action log directly into the on-chain metadata field

Why:

* Standard metadata structures were never designed for large game replay payloads
* The official docs emphasize the normal pattern: metadata on-chain stores a URI, and the detailed JSON lives off-chain

#### What You Should Do

Store only these on-chain or in the metadata JSON:

* `action_log_hash`
* `proof_uri`

Then:

* `proof_uri` points to the replay file on IPFS / Arweave
* The verifier downloads the file and checks whether the hash matches

That is the correct architecture.

* * *

#### The Best Way to Express This Idea

Not:

> Put the data into the NFT, and then cheating NFTs will automatically lose value

But rather:

> Embed daily challenge proof into NFT metadata and a traceable proof package, so that legitimate results become publicly auditable; the official frontend and community tools can then distinguish verified achievement NFTs from unverified ones.

That wording is more accurate and more professional.

* * *

#### My Final Recommendation

#### For the Hackathon Version, Build It Like This

#### Include These in the NFT Metadata / JSON

* `day_id`
* `run_id`
* `score`
* `tier`
* `ruleset_hash`
* `seed_commit`
* `action_log_hash`
* `final_state_hash`
* `proof_uri`
* `verification_hint`
* `game_version`

#### Your Official Website Recognizes Only Two Types

* `Replay Available`
* `Replay Verified`

#### Things You Should Not Promise

* Do not promise that the chain will automatically destroy cheating NFTs
* Do not promise that marketplaces will automatically recognize invalid NFTs
* Do not strongly bind high-value economics to leaderboard ranks that have not gone through final verification

That is very reasonable, and achievable within a hackathon.

* * *

#### One-Sentence Conclusion

**Yes, it is viable, and it is a good design—but what it improves is “verifiability and traceability,” not “automatic punishment.”**  
If you want cheating NFTs to truly “lose value,” you still need your frontend, community standards, or a later verification registry to distinguish which NFTs are `Verified` and which are merely `Self-Reported`.

My next step could be to write out an **NFT metadata JSON schema** for you so all of these fields are locked in at once.