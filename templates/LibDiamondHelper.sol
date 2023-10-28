// SPDX-License-Identifier: __SOLC_SPDX__
pragma solidity >=__SOLC_VERSION__;

/// ------------------------------------------------------------------------------------------------------------
///
/// NOTE: This file is auto-generated by Gemforge.
///
/// ------------------------------------------------------------------------------------------------------------

import { IDiamondCut } from "__LIB_DIAMOND_PATH__/contracts/interfaces/IDiamondCut.sol";
import { IDiamondProxy } from "./IDiamondProxy.sol";

__FACET_IMPORTS__

struct FacetSelectors {
  address addr;
  bytes4[] sels;
}

library LibDiamondHelper {
  function deployFacetsAndGetCuts(address proxy) internal returns (IDiamondCut.FacetCut[] memory cut) {
    // initialize the diamond as well as cut in all facets
    FacetSelectors[] memory fs = new FacetSelectors[](__NUM_FACETS__);

__FACET_SELECTORS__

    /*
    Work out whether selectors must be added or replaced instead.
    This is relevant if/when we are overriding base facet functions (i.e. diamondCut()).
    */

    IDiamondProxy p = IDiamondProxy(proxy);
    IDiamondCut.FacetCut[] memory tempCut = new IDiamondCut.FacetCut[](fs.length * 2);
    bytes4[] memory add;
    bytes4[] memory replace;
    uint addLen;
    uint replaceLen;
    uint tempCutLen;
    FacetSelectors memory fsi;

    for (uint i = 0; i < fs.length; i++) {
      fsi = fs[i];
      add = new bytes4[](fsi.sels.length);
      addLen = 0;
      replace = new bytes4[](fsi.sels.length);
      replaceLen = 0;

      for (uint j = 0; j < fsi.sels.length; j++) {
        bytes4 sel = fsi.sels[j];

        if (address(0) != p.facetAddress(sel)) {
          replace[replaceLen] = sel;
          replaceLen++;
        } else {
          add[addLen] = sel;
          addLen++;
        }
      }

      if (addLen > 0) {
        tempCut[tempCutLen] = IDiamondCut.FacetCut({
          facetAddress: fsi.addr,
          action: IDiamondCut.FacetCutAction.Add,
          functionSelectors: cpArray(add, addLen)
        });
        tempCutLen++;
      }

      if (replaceLen > 0) {
        tempCut[tempCutLen] = IDiamondCut.FacetCut({
          facetAddress: fsi.addr,
          action: IDiamondCut.FacetCutAction.Replace,
          functionSelectors: cpArray(replace, replaceLen)
        });
        tempCutLen++;
      }
    }

    cut = new IDiamondCut.FacetCut[](tempCutLen);
    for (uint i = 0; i < tempCutLen; i++) {
      cut[i] = tempCut[i];
    }
  }

  function cpArray(bytes4[] memory src, uint lenToCopy) private pure returns (bytes4[] memory ret) {
    ret = new bytes4[](lenToCopy);
    for (uint i = 0; i < lenToCopy; i++) {
      ret[i] = src[i];
    }
  }
}
