var move = function (direction) {};

var pick = function () {};

var drop = function (_id) {};


function selectionSort (sortMe)
{
    var i, j, tmp, tmp2;
    for (i = 0; i < sortMe.length - 1; i++)
    {
        tmp = i;
        for (j = i + 1; j < sortMe.length; j++){
            if (sortMe[j] < sortMe[tmp]){
                tmp = j;
            }
        }
        if(tmp!=i){
            tmp2 = sortMe[tmp];
            sortMe[tmp] = sortMe[i];
            sortMe[i] = tmp2;
        }
}


var sortByName = function (items) {
    /**
     * Sorts the input objects by the name variable.
     * @param {Array<Object>} items - list of items, Format [{name, x, y, _id}]
     * @return {Object} Q.Promise with the sorted array of items.
     */
    var swapped, i, temp;
        moveToBegining().then ->
        for (i=0; i < items.length-1; i++) {
            if (a[i].name > a[i+1].name) {
                return swap(i, i+1)
            }
        }
    }
    while (swapped);
};

var moveToBeginning = function (current, start) {
    var stepsX = start[0] - current[0],
        stepsY = start[1] - current[1];

    Q().then(function () {
        _.map(_.range(stepsX), function (i) {
            return function () {
                return move('right');
            };
        });
    }).then(function () {
        _.map(_.range(stepsY), function (i) {
            return function () {
                return move('left');
            };
        });
    });
};

// Start processing.
Q().then ->
    moveToBeginning()
.then ->
    sortByName()
.done()
