"""Challenge starting sun and native seed-packet recharge, after normal modifiers."""
from pathlib import Path

def helper():
    return (Path(__file__).with_name('challenge-nursery.js')).read_text(encoding='utf8')

def apply(source):
    from fairplay import once
    # Native stage, last-stand and intro modules have settled StartingSun here.
    # Reloading or changing challenge mode creates a new level component.
    source = once(source, 'gardenChallenge.beforeChooser(this,ta,A.component);',
                  'gardenChallenge.beforeChooser(this,ta,A.component);gardenChallengeNursery.start(this,H.component);')
    # One timer initializer serves gameStart(CooldownFrom), planting and copies.
    # Its fraction already includes native boosts and Last Stand exemptions.
    return once(source, 'this.Cooldown=t.Cooldown,this.CD=o*this.Cooldown',
                'this.Cooldown=gardenChallengeNursery.duration(t.Cooldown,_.component),this.CD=o*this.Cooldown')
