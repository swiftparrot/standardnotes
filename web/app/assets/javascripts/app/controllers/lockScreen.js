class LockScreen {

  constructor() {
    this.restrict = "E";
    this.templateUrl = "lock-screen.html";
    this.scope = {
      onSuccess: "&",
    };
  }

  controller($scope, passcodeManager, authManager, syncManager, storageManager) {
    'ngInject';

    $scope.formData = {};

    this.visibilityObserver = passcodeManager.addVisibilityObserver((visible) => {
      if(visible) {
        let input = document.getElementById("passcode-input");
        if(input) {
          input.focus();
        }
      }
    })

    $scope.$on("$destroy", () => {
      passcodeManager.removeVisibilityObserver(this.visibilityObserver);
    });

    $scope.submitPasscodeForm = function() {
      if(!$scope.formData.passcode || $scope.formData.passcode.length == 0) {
        return;
      }
      passcodeManager.unlock($scope.formData.passcode, (success) => {
        if(!success) {
          alert("Invalid passcode. Please try again.");
          return;
        }

        $scope.onSuccess()();
      })
    }

    $scope.forgotPasscode = function() {
      $scope.formData.showRecovery = true;
    }

    $scope.beginDeleteData = function() {
      if(!confirm("Are you sure you want to clear all local data?")) {
        return;
      }

      authManager.signout(true).then(() => {
        window.location.reload();
      })
    }
  }
}

angular.module('app').directive('lockScreen', () => new LockScreen);
