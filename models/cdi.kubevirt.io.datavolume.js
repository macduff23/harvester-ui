import { colorForState } from '@/plugins/steve/resource-instance';
import { VM, DATA_VOLUME } from '@/config/types';
import { DATA_VOLUME_OWNEDBY } from '@/config/labels-annotations';

export default {
  stateDisplay() {
    const ownedBy = this?.metadata?.annotations?.[DATA_VOLUME_OWNEDBY];

    if (ownedBy) {
      return 'In-use';
    } else {
      return 'Ready';
    }
  },

  stateBackground() {
    return colorForState(this.stateDisplay).replace('text-', 'bg-');
  },

  statusDisplay() {
    const readyCondition = this?.getStatusConditionOfType('Ready');

    return readyCondition?.status === 'True' ? 'Ready' : 'NoReady';
  },

  phaseStatus() {
    return this?.status?.phase || 'N/A';
  },

  attachVM() {
    const vmList = this.$rootGetters['cluster/all'](VM);
    const ownerAnnotation = this.getAnnotationValue(DATA_VOLUME_OWNEDBY);

    if (!ownerAnnotation) {
      return;
    }

    const owner = JSON.parse(ownerAnnotation)[0]?.refs?.[0];

    return vmList.find( (D) => {
      return D.id === owner;
    });
  },

  isRWO() {
    return this.spec?.pvc?.accessModes?.[0] === 'ReadWriteOnce';
  },

  warningCount() {
    return this.resourcesStatus.warningCount;
  },

  errorCount() {
    return this.resourcesStatus.errorCount;
  },

  resourcesStatus() {
    const list = this.$rootGetters['cluster/all'](DATA_VOLUME);

    let warning = 0;
    let error = 0;

    list.forEach((item) => {
      const status = item.getStatusConditionOfType('Ready')?.status;

      if (status === 'False') {
        error += 1;
      } else if (status === 'Unknown') {
        warning += 1;
      }
    });

    return {
      warningCount: warning,
      errorCount:   error
    };
  },
};
