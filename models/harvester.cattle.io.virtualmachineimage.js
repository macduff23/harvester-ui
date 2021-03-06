import { colorForState } from '@/plugins/steve/resource-instance';
import { VM, IMAGE } from '@/config/types';

export default {
  availableActions() {
    const out = this._standardActions;
    const b = this.stateDisplay !== 'Failed';

    return [
      {
        action:     'createFromImage',
        enabled:    b,
        icon:       'icon icon-fw icon-spinner',
        label:      'Create a Virtual Machine',
      },
      ...out
    ];
  },

  createFromImage() {
    return () => {
      const router = this.currentRouter();

      router.push({
        name:   `c-cluster-product-resource-create`,
        params: { resource: VM },
        query:  { image: this.spec.displayName }
      });
    };
  },

  isReady() {
    return this?.status?.conditions?.[0].status === 'True';
  },

  stateDisplay() {
    const status = this.getStatusConditionOfType('imported')?.status;

    if (status === undefined) {
      return 'Unknown';
    }

    return status === 'True' ? 'Imported' : status === 'Unknown' ? 'In-progress' : 'Failed';
  },

  stateBackground() {
    return colorForState(this.stateDisplay).replace('text-', 'bg-');
  },

  warningCount() {
    return this.resourcesStatus.warningCount;
  },

  errorCount() {
    return this.resourcesStatus.errorCount;
  },

  resourcesStatus() {
    const imageList = this.$rootGetters['cluster/all'](IMAGE);

    let warning = 0;
    let error = 0;

    imageList.forEach((item) => {
      const status = item.getStatusConditionOfType('imported')?.status;

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
