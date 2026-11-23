from fairplay import once

def apply(source):
    # Reuse the vacant native settings cell. Its previous cheat handler stays inert.
    source=once(source,'this.AllowCheat.node.active=false','this.AllowCheat.node.active=true')
    source=once(source,'(function(node){while(node&&node.name!=="AllowCheat")node=node.parent;if(node)node.active=false})(this.allowCheatSprite.node)',
                'gardenCompatibilitySettings.setupMain(this)')
    source=once(source,'a.setAllowCheat=function(){}','a.setAllowCheat=function(){},a.openGardenSettings=function(){gardenCompatibilitySettings.open(false)}')
    source=once(source,'a.onEnable=function(){},a.uiCardsLayer=', 'a.onEnable=function(){gardenCompatibilitySettings.paintMain(this)},a.uiCardsLayer=')
    source=once(source,'n.onEnable=function(){this.correctHeight(),this.ExitWindow.active=this.RestartWindow.active=!1}',
                'n.onEnable=function(){this.correctHeight(),this.ExitWindow.active=this.RestartWindow.active=!1,gardenCompatibilitySettings.setupPause(this)}')
    return source
