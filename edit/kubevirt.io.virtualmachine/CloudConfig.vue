<script>
import YamlEditor, { EDITOR_MODES } from '@/components/YamlEditor';

export default {
  components: { YamlEditor },

  props: {
    userScript: {
      type:    String,
      default: ''
    },
    networkScript: {
      type:    String,
      default: ''
    }
  },

  data() {
    return {
      editorMode:  EDITOR_MODES.EDIT_CODE,
      userData:    this.userScript,
      networkData: this.networkScript
    };
  },

  methods: {
    update() {
      this.$emit('updateCloudConfig', this.userData, this.networkData);
    },
    onChanges(cm, changes) {
      this.update();
      if ( changes.length !== 1 ) {
        return;
      }

      const change = changes[0];

      if ( change.from.line !== change.to.line ) {
        return;
      }

      let line = change.from.line;
      let str = cm.getLine(line);
      let maxIndent = indentChars(str);

      if ( maxIndent === null ) {
        return;
      }

      cm.replaceRange('', { line, ch: 0 }, { line, ch: 1 }, '+input');

      while ( line > 0 ) {
        line--;
        str = cm.getLine(line);
        const indent = indentChars(str);

        if ( indent === null ) {
          break;
        }

        if ( indent < maxIndent ) {
          cm.replaceRange('', { line, ch: 0 }, { line, ch: 1 }, '+input');

          if ( indent === 0 ) {
            break;
          }

          maxIndent = indent;
        }
      }

      function indentChars(str) {
        const match = str.match(/^#(\s+)/);

        if ( match ) {
          return match[1].length;
        }

        return null;
      }
    },
  }
};
</script>

<template>
  <div @input="update">
    <h3>Cloud Config</h3>
    <div class="mb-20">
      <h4>
        User Data:
        <h5>
          You can specify user data to configure an instance or run a configuration script during launch. If you launch more than one instance at a time, the user data is available to all the instances in that reservation.
          <a target="_blank" href="https://cloudinit.readthedocs.io/en/latest/topics/examples.html">Learn more</a>
        </h5>
      </h4>
      <div class="resource-yaml">
        <YamlEditor
          ref="yamlUser"
          v-model="userData"
          class="yaml-editor"
          :editor-mode="editorMode"
          @onChanges="onChanges"
        />
      </div>
    </div>

    <div>
      <h4>
        Network Data:
        <h5>
          The network-data configuration allows you to customize the instance’s networking interfaces by assigning subnet configuration, virtual device creation (bonds, bridges, vlans) routes and DNS configuration.
          <a target="_blank" href="https://cloudinit.readthedocs.io/en/latest/topics/network-config-format-v1.html">Learn more</a>
        </h5>
      </h4>

      <div class="resource-yaml">
        <YamlEditor
          ref="yamlNetwork"
          v-model="networkData"
          class="yaml-editor"
          :editor-mode="editorMode"
          @onChanges="onChanges"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
$yaml-height: 200px;

.resource-yaml {
  flex: 1;
  display: flex;
  flex-direction: column;

  & .yaml-editor{
    flex: 1;
    min-height: $yaml-height;
    & .code-mirror .CodeMirror {
      position: initial;
      height: auto;
      min-height: $yaml-height;
    }
  }

  footer .actions {
    text-align: center;
  }
}
</style>
